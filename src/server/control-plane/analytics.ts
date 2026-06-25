import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  badRequest,
  getDateRange,
  getLimit,
  getPagination,
  rate,
  requireBuyerApiKey,
} from './http';

type BuyerIdentity = {
  id: string;
  clerk_user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
};

type CartItemShape = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

type CartWithBuyerAndItems = {
  id: string;
  buyer_id: string;
  created_at: Date;
  updated_at: Date;
  buyer: BuyerIdentity;
  items: CartItemShape[];
};

type DateRange = {
  from: Date | null;
  to: Date | null;
};

export async function getBuyerOverview(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const where = buyerCreatedAtWhere(range);

  const [
    totalBuyers,
    buyersWithCompleteProfile,
    buyersWithShippingAddress,
    buyersWithoutShippingAddress,
    buyersWithCartItems,
    checkoutReadyBuyers,
  ] = await prisma.$transaction([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.count({ where: andBuyerWhere(where, completeBuyerProfileWhere()) }),
    prisma.buyerProfile.count({ where: andBuyerWhere(where, { addresses: { some: {} } }) }),
    prisma.buyerProfile.count({ where: andBuyerWhere(where, { addresses: { none: {} } }) }),
    prisma.buyerProfile.count({ where: andBuyerWhere(where, buyerWithCartItemsWhere()) }),
    prisma.buyerProfile.count({ where: andBuyerWhere(where, checkoutReadyBuyerWhere()) }),
  ]);

  return Response.json({
    from: range.from,
    to: range.to,
    totalBuyers,
    buyersWithCompleteProfile,
    buyersWithShippingAddress,
    buyersWithoutShippingAddress,
    buyersWithCartItems,
    checkoutReadyBuyers,
    checkoutReadinessRate: rate(checkoutReadyBuyers, totalBuyers),
  });
}

export async function getNewBuyers(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const { page, skip, take } = getPagination(request);
  const where = buyerCreatedAtWhere(range);
  const [total, buyerDates, buyers] = await prisma.$transaction([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.findMany({
      where,
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    }),
    prisma.buyerProfile.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      select: buyerIdentitySelect,
    }),
  ]);

  return Response.json({
    page,
    take,
    total,
    from: range.from,
    to: range.to,
    buckets: countByDate(buyerDates.map((buyer) => buyer.created_at)),
    buyers: buyers.map(mapBuyerIdentity),
  });
}

export async function getBuyersWithAddress(request: Request) {
  return getBuyersByAddressPresence(request, true);
}

export async function getBuyersWithoutAddress(request: Request) {
  return getBuyersByAddressPresence(request, false);
}

export async function getCartOverview(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const cutoff = getAbandonedCutoff(request);
  if ('response' in cutoff) return cutoff.response;

  const where = cartUpdatedAtWhere(range);

  const carts = await prisma.cart.findMany({
    where,
    include: { buyer: true, items: true },
  });
  const activeCarts = carts.filter((cart) => cart.items.length > 0);
  const abandonedCarts = activeCarts.filter((cart) =>
    isCartAbandoned(cart.items, cutoff.cutoff),
  );

  return Response.json({
    from: range.from,
    to: range.to,
    totalCarts: carts.length,
    activeCarts: activeCarts.length,
    emptyCarts: carts.length - activeCarts.length,
    abandonedCarts: abandonedCarts.length,
    abandonedAfterDays: cutoff.inactiveDays,
    averageDistinctItemsPerCart: average(
      activeCarts.map((cart) => cart.items.length),
    ),
    averageQuantityPerCart: average(
      activeCarts.map((cart) => sumCartQuantity(cart.items)),
    ),
  });
}

export async function getActiveCarts(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const { page, skip, take } = getPagination(request);
  const where = andCartWhere(cartUpdatedAtWhere(range), {
    items: { some: {} },
  });
  const [total, carts] = await prisma.$transaction([
    prisma.cart.count({ where }),
    prisma.cart.findMany({
      where,
      skip,
      take,
      orderBy: { updated_at: 'desc' },
      include: { buyer: true, items: { orderBy: { updated_at: 'desc' } } },
    }),
  ]);

  return Response.json({
    from: range.from,
    to: range.to,
    page,
    take,
    total,
    carts: carts.map(mapCartAnalytics),
  });
}

export async function getAbandonedCarts(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const cutoff = getAbandonedCutoff(request);
  if ('response' in cutoff) return cutoff.response;

  const { page, skip, take } = getPagination(request);
  const where = andCartWhere(cartUpdatedAtWhere(range), {
    items: {
      some: {},
      every: { updated_at: { lt: cutoff.cutoff } },
    },
  });
  const [total, carts] = await prisma.$transaction([
    prisma.cart.count({ where }),
    prisma.cart.findMany({
      where,
      skip,
      take,
      orderBy: { updated_at: 'asc' },
      include: { buyer: true, items: { orderBy: { updated_at: 'desc' } } },
    }),
  ]);

  return Response.json({
    from: range.from,
    to: range.to,
    page,
    take,
    total,
    abandonedAfterDays: cutoff.inactiveDays,
    cutoff: cutoff.cutoff,
    carts: carts.map(mapCartAnalytics),
  });
}

export async function getAverageCartItems(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const carts = await prisma.cart.findMany({
    where: cartUpdatedAtWhere(range),
    include: { items: true },
  });
  const activeCarts = carts.filter((cart) => cart.items.length > 0);

  return Response.json({
    from: range.from,
    to: range.to,
    totalCarts: carts.length,
    activeCarts: activeCarts.length,
    averageDistinctItemsAcrossAllCarts: average(
      carts.map((cart) => cart.items.length),
    ),
    averageDistinctItemsAcrossActiveCarts: average(
      activeCarts.map((cart) => cart.items.length),
    ),
    averageQuantityAcrossAllCarts: average(
      carts.map((cart) => sumCartQuantity(cart.items)),
    ),
    averageQuantityAcrossActiveCarts: average(
      activeCarts.map((cart) => sumCartQuantity(cart.items)),
    ),
  });
}

export async function getTopCartProducts(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const limit = getLimit(request);
  const items = await prisma.cartItem.findMany({
    where: cartItemUpdatedAtWhere(range),
    select: { product_id: true, cart_id: true, quantity: true },
  });
  const productMap = new Map<
    string,
    { productId: string; totalQuantity: number; lineCount: number; cartIds: Set<string> }
  >();

  for (const item of items) {
    const current = productMap.get(item.product_id) ?? {
      productId: item.product_id,
      totalQuantity: 0,
      lineCount: 0,
      cartIds: new Set<string>(),
    };

    current.totalQuantity += item.quantity;
    current.lineCount += 1;
    current.cartIds.add(item.cart_id);
    productMap.set(item.product_id, current);
  }

  const products = [...productMap.values()]
    .sort(
      (current, next) =>
        next.totalQuantity - current.totalQuantity ||
        next.cartIds.size - current.cartIds.size ||
        current.productId.localeCompare(next.productId),
    )
    .slice(0, limit)
    .map((product) => ({
      productId: product.productId,
      totalQuantity: product.totalQuantity,
      cartCount: product.cartIds.size,
      lineCount: product.lineCount,
    }));

  return Response.json({ from: range.from, to: range.to, limit, products });
}

export async function getCartsByBuyer(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const { page, skip, take } = getPagination(request);
  const where = buyerWithCartItemsWhere(cartUpdatedAtWhere(range));
  const [total, buyers] = await prisma.$transaction([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.findMany({
      where,
      skip,
      take,
      orderBy: { updated_at: 'desc' },
      include: {
        cart: { include: { items: { orderBy: { updated_at: 'desc' } } } },
        _count: { select: { addresses: true } },
      },
    }),
  ]);

  return Response.json({
    from: range.from,
    to: range.to,
    page,
    take,
    total,
    buyers: buyers.map((buyer) => ({
      ...mapBuyerIdentity(buyer),
      addressCount: buyer._count.addresses,
      cart: buyer.cart
        ? {
            id: buyer.cart.id,
            itemCount: buyer.cart.items.length,
            totalQuantity: sumCartQuantity(buyer.cart.items),
            updatedAt: buyer.cart.updated_at,
            lastItemActivityAt: getLastItemActivityAt(buyer.cart.items),
          }
        : null,
    })),
  });
}

export async function getShippingAddressOverview(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const where = shippingAddressCreatedAtWhere(range);

  const [totalAddresses, totalBuyers, buyersWithAddress, addresses] =
    await prisma.$transaction([
      prisma.shippingAddress.count({ where }),
      prisma.buyerProfile.count(),
      prisma.buyerProfile.count({ where: { addresses: { some: where } } }),
      prisma.shippingAddress.findMany({
        where,
        select: { city: true, province: true },
      }),
    ]);
  const cityCounts = countByString(addresses.map((address) => address.city));
  const provinceCounts = countByString(
    addresses.map((address) => address.province),
  );

  return Response.json({
    from: range.from,
    to: range.to,
    totalAddresses,
    totalBuyers,
    buyersWithAddress,
    buyersWithoutAddress: totalBuyers - buyersWithAddress,
    averageAddressesPerBuyer: averageFor(totalAddresses, totalBuyers),
    averageAddressesPerAddressedBuyer: averageFor(totalAddresses, buyersWithAddress),
    topCity: cityCounts[0] ?? null,
    topProvince: provinceCounts[0] ?? null,
  });
}

export async function getShippingAddressesByCity(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const addresses = await prisma.shippingAddress.findMany({
    where: shippingAddressCreatedAtWhere(range),
    select: { city: true },
  });

  return Response.json({
    from: range.from,
    to: range.to,
    cities: countByString(addresses.map((address) => address.city)),
  });
}

export async function getShippingAddressesByProvince(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const addresses = await prisma.shippingAddress.findMany({
    where: shippingAddressCreatedAtWhere(range),
    select: { province: true },
  });

  return Response.json({
    from: range.from,
    to: range.to,
    provinces: countByString(addresses.map((address) => address.province)),
  });
}

export async function getShippingAddressCompleteness(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const addresses = await prisma.shippingAddress.findMany({
    where: shippingAddressCreatedAtWhere(range),
    select: {
      label: true,
      address: true,
      city: true,
      postal_code: true,
      province: true,
      country: true,
      apartment: true,
      floor: true,
    },
  });
  const total = addresses.length;
  const completeRequiredFields = addresses.filter(hasCompleteRequiredAddressFields).length;
  const withLabel = addresses.filter((address) => hasText(address.label)).length;
  const withApartment = addresses.filter((address) => hasText(address.apartment)).length;
  const withFloor = addresses.filter((address) => hasText(address.floor)).length;
  const withApartmentOrFloor = addresses.filter(
    (address) => hasText(address.apartment) || hasText(address.floor),
  ).length;

  return Response.json({
    from: range.from,
    to: range.to,
    totalAddresses: total,
    completeRequiredFields,
    incompleteRequiredFields: total - completeRequiredFields,
    completeRequiredFieldsRate: rate(completeRequiredFields, total),
    withLabel,
    withLabelRate: rate(withLabel, total),
    withApartment,
    withFloor,
    withApartmentOrFloor,
    withApartmentOrFloorRate: rate(withApartmentOrFloor, total),
  });
}

async function getBuyersByAddressPresence(request: Request, hasAddress: boolean) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const range = getDateRange(request);
  if ('response' in range) return range.response;

  const { page, skip, take } = getPagination(request);
  const where = andBuyerWhere(buyerCreatedAtWhere(range), {
    addresses: hasAddress ? { some: {} } : { none: {} },
  });
  const [total, buyers] = await prisma.$transaction([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { addresses: true } } },
    }),
  ]);

  return Response.json({
    from: range.from,
    to: range.to,
    page,
    take,
    total,
    buyers: buyers.map((buyer) => ({
      ...mapBuyerIdentity(buyer),
      addressCount: buyer._count.addresses,
    })),
  });
}

function buyerCreatedAtWhere(range: DateRange): Prisma.BuyerProfileWhereInput {
  return {
    ...dateRangeWhere('created_at', range),
  };
}

function cartUpdatedAtWhere(range: DateRange): Prisma.CartWhereInput {
  return {
    ...dateRangeWhere('updated_at', range),
  };
}

function cartItemUpdatedAtWhere(range: DateRange): Prisma.CartItemWhereInput {
  return {
    ...dateRangeWhere('updated_at', range),
  };
}

function shippingAddressCreatedAtWhere(
  range: DateRange,
): Prisma.ShippingAddressWhereInput {
  return {
    ...dateRangeWhere('created_at', range),
  };
}

function dateRangeWhere(field: 'created_at' | 'updated_at', range: DateRange) {
  if (!range.from && !range.to) {
    return {};
  }

  return {
    [field]: {
      ...(range.from ? { gte: range.from } : {}),
      ...(range.to ? { lte: range.to } : {}),
    },
  };
}

function andBuyerWhere(
  ...conditions: Prisma.BuyerProfileWhereInput[]
): Prisma.BuyerProfileWhereInput {
  return { AND: conditions };
}

function andCartWhere(...conditions: Prisma.CartWhereInput[]): Prisma.CartWhereInput {
  return { AND: conditions };
}

function completeBuyerProfileWhere(): Prisma.BuyerProfileWhereInput {
  return {
    AND: [
      { first_name: { not: null } },
      { first_name: { not: '' } },
      { last_name: { not: null } },
      { last_name: { not: '' } },
      { phone: { not: null } },
      { phone: { not: '' } },
    ],
  };
}

function buyerWithCartItemsWhere(
  cartWhere: Prisma.CartWhereInput = {},
): Prisma.BuyerProfileWhereInput {
  return {
    cart: {
      is: {
        ...cartWhere,
        items: { some: {} },
      },
    },
  };
}

function checkoutReadyBuyerWhere(): Prisma.BuyerProfileWhereInput {
  return {
    AND: [
      completeBuyerProfileWhere(),
      { addresses: { some: {} } },
      buyerWithCartItemsWhere(),
    ],
  };
}

const buyerIdentitySelect = {
  id: true,
  clerk_user_id: true,
  first_name: true,
  last_name: true,
  phone: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.BuyerProfileSelect;

function mapBuyerIdentity(buyer: BuyerIdentity) {
  return {
    id: buyer.id,
    clerkUserId: buyer.clerk_user_id,
    firstName: buyer.first_name,
    lastName: buyer.last_name,
    phone: buyer.phone,
    createdAt: buyer.created_at,
    updatedAt: buyer.updated_at,
  };
}

function mapCartAnalytics(cart: CartWithBuyerAndItems) {
  return {
    id: cart.id,
    buyerId: cart.buyer_id,
    buyer: mapBuyerIdentity(cart.buyer),
    itemCount: cart.items.length,
    totalQuantity: sumCartQuantity(cart.items),
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
    lastItemActivityAt: getLastItemActivityAt(cart.items),
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  };
}

function getAbandonedCutoff(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawInactiveDays = searchParams.get('inactiveDays');
  const inactiveDays = rawInactiveDays ? Number.parseInt(rawInactiveDays, 10) : 7;

  if (!Number.isFinite(inactiveDays) || inactiveDays < 1 || inactiveDays > 365) {
    return { response: badRequest('inactiveDays must be between 1 and 365') };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - inactiveDays);

  return { inactiveDays, cutoff };
}

function isCartAbandoned(items: CartItemShape[], cutoff: Date) {
  return items.length > 0 && items.every((item) => item.updated_at < cutoff);
}

function sumCartQuantity(items: Pick<CartItemShape, 'quantity'>[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function getLastItemActivityAt(items: CartItemShape[]) {
  return items.reduce<Date | null>((latest, item) => {
    if (!latest || item.updated_at > latest) {
      return item.updated_at;
    }

    return latest;
  }, null);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number(
    (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
  );
}

function averageFor(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(2));
}

function countByDate(dates: Date[]) {
  const buckets = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

function countByString(values: string[]) {
  const buckets = new Map<string, number>();

  for (const value of values) {
    const normalized = value.trim() || 'Unknown';
    buckets.set(normalized, (buckets.get(normalized) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort(
      (current, next) =>
        next.count - current.count || current.value.localeCompare(next.value),
    );
}

function hasCompleteRequiredAddressFields(address: {
  address: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
}) {
  return Boolean(
    address.address.trim() &&
      address.city.trim() &&
      address.postal_code.trim() &&
      address.province.trim() &&
      address.country.trim(),
  );
}

function hasText(value: string | null) {
  return Boolean(value?.trim());
}
