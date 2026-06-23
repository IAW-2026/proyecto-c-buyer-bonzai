import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  getPagination,
  notFound,
  parseJsonBody,
  requireBuyerApiKey,
  type RouteParams,
  validationError,
} from './http';
import {
  buyerProfilePatchSchema,
  shippingAddressPatchSchema,
} from './schemas';

type BuyerIdentity = {
  id: string;
  clerk_user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
};

type AddressShape = {
  id: string;
  buyer_id: string;
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postal_code: string;
  province: string;
  country: string;
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

type CartShape = {
  id: string;
  buyer_id: string;
  created_at: Date;
  updated_at: Date;
  buyer?: BuyerIdentity;
  items: CartItemShape[];
};

export async function listBuyers(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { page, skip, take } = getPagination(request);
  const where = getBuyerSearchWhere(request);
  const [total, buyers] = await prisma.$transaction([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { addresses: true } },
        cart: { include: { items: { orderBy: { created_at: 'asc' } } } },
      },
    }),
  ]);

  return Response.json({
    page,
    take,
    total,
    buyers: buyers.map((buyer) => ({
      ...mapBuyerIdentity(buyer),
      isProfileComplete: isProfileComplete(buyer),
      addressCount: buyer._count.addresses,
      hasCart: buyer.cart !== null,
      cartItemCount: buyer.cart?.items.length ?? 0,
      cartQuantity: sumCartQuantity(buyer.cart?.items ?? []),
    })),
  });
}

export async function getBuyer(
  request: Request,
  { params }: RouteParams<{ buyerId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { buyerId } = await params;
  const buyer = await prisma.buyerProfile.findUnique({
    where: { id: buyerId },
    include: {
      addresses: { orderBy: { created_at: 'asc' } },
      cart: { include: { items: { orderBy: { created_at: 'asc' } } } },
    },
  });

  if (!buyer) {
    return notFound('Buyer not found');
  }

  return Response.json({
    buyer: {
      ...mapBuyerIdentity(buyer),
      isProfileComplete: isProfileComplete(buyer),
      addresses: buyer.addresses.map(mapAddress),
      cart: buyer.cart ? mapCart(buyer.cart) : null,
    },
  });
}

export async function updateBuyer(
  request: Request,
  { params }: RouteParams<{ buyerId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const body = await parseJsonBody(request);
  if ('response' in body) return body.response;

  const result = buyerProfilePatchSchema.safeParse(body.data);
  if (!result.success) {
    return validationError(result.error);
  }

  const { buyerId } = await params;
  const existingBuyer = await prisma.buyerProfile.findUnique({
    where: { id: buyerId },
    select: { id: true },
  });

  if (!existingBuyer) {
    return notFound('Buyer not found');
  }

  const data: Prisma.BuyerProfileUpdateInput = {};

  if (result.data.firstName !== undefined) {
    data.first_name = result.data.firstName;
  }

  if (result.data.lastName !== undefined) {
    data.last_name = result.data.lastName;
  }

  if (result.data.phone !== undefined) {
    data.phone = result.data.phone;
  }

  const buyer = await prisma.buyerProfile.update({
    where: { id: buyerId },
    data,
  });

  return Response.json({
    buyer: {
      ...mapBuyerIdentity(buyer),
      isProfileComplete: isProfileComplete(buyer),
    },
  });
}

export async function listBuyerShippingAddresses(
  request: Request,
  { params }: RouteParams<{ buyerId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { buyerId } = await params;
  const buyer = await prisma.buyerProfile.findUnique({
    where: { id: buyerId },
    select: {
      id: true,
      addresses: { orderBy: { created_at: 'asc' } },
    },
  });

  if (!buyer) {
    return notFound('Buyer not found');
  }

  return Response.json({
    buyerId: buyer.id,
    addresses: buyer.addresses.map(mapAddress),
  });
}

export async function getBuyerCart(
  request: Request,
  { params }: RouteParams<{ buyerId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { buyerId } = await params;
  const buyer = await prisma.buyerProfile.findUnique({
    where: { id: buyerId },
    select: {
      id: true,
      cart: { include: { items: { orderBy: { created_at: 'asc' } } } },
    },
  });

  if (!buyer) {
    return notFound('Buyer not found');
  }

  return Response.json({
    buyerId: buyer.id,
    cart: buyer.cart ? mapCart(buyer.cart) : null,
  });
}

export async function listShippingAddresses(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { page, skip, take } = getPagination(request);
  const [total, addresses] = await prisma.$transaction([
    prisma.shippingAddress.count(),
    prisma.shippingAddress.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: { buyer: true },
    }),
  ]);

  return Response.json({
    page,
    take,
    total,
    addresses: addresses.map((address) => ({
      ...mapAddress(address),
      buyer: mapBuyerIdentity(address.buyer),
    })),
  });
}

export async function updateShippingAddress(
  request: Request,
  { params }: RouteParams<{ addressId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const body = await parseJsonBody(request);
  if ('response' in body) return body.response;

  const result = shippingAddressPatchSchema.safeParse(body.data);
  if (!result.success) {
    return validationError(result.error);
  }

  const { addressId } = await params;
  const existingAddress = await prisma.shippingAddress.findUnique({
    where: { id: addressId },
    select: { id: true },
  });

  if (!existingAddress) {
    return notFound('Shipping address not found');
  }

  const data: Prisma.ShippingAddressUpdateInput = {};

  if (result.data.label !== undefined) data.label = result.data.label;
  if (result.data.address !== undefined) data.address = result.data.address;
  if (result.data.apartment !== undefined) data.apartment = result.data.apartment;
  if (result.data.floor !== undefined) data.floor = result.data.floor;
  if (result.data.city !== undefined) data.city = result.data.city;
  if (result.data.postalCode !== undefined) data.postal_code = result.data.postalCode;
  if (result.data.province !== undefined) data.province = result.data.province;
  if (result.data.country !== undefined) data.country = result.data.country;

  const address = await prisma.shippingAddress.update({
    where: { id: addressId },
    data,
    include: { buyer: true },
  });

  return Response.json({
    address: {
      ...mapAddress(address),
      buyer: mapBuyerIdentity(address.buyer),
    },
  });
}

export async function deleteShippingAddress(
  request: Request,
  { params }: RouteParams<{ addressId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { addressId } = await params;
  const result = await prisma.shippingAddress.deleteMany({
    where: { id: addressId },
  });

  if (result.count === 0) {
    return notFound('Shipping address not found');
  }

  return Response.json({ deleted: true });
}

export async function listCarts(request: Request) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { page, skip, take } = getPagination(request);
  const [total, carts] = await prisma.$transaction([
    prisma.cart.count(),
    prisma.cart.findMany({
      skip,
      take,
      orderBy: { updated_at: 'desc' },
      include: {
        buyer: true,
        items: { orderBy: { created_at: 'asc' } },
      },
    }),
  ]);

  return Response.json({
    page,
    take,
    total,
    carts: carts.map(mapCart),
  });
}

export async function getCart(
  request: Request,
  { params }: RouteParams<{ cartId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { cartId } = await params;
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      buyer: true,
      items: { orderBy: { created_at: 'asc' } },
    },
  });

  if (!cart) {
    return notFound('Cart not found');
  }

  return Response.json({ cart: mapCart(cart) });
}

export async function deleteCartItem(
  request: Request,
  { params }: RouteParams<{ cartId: string; itemId: string }>,
) {
  const authError = await requireBuyerApiKey(request);
  if (authError) return authError;

  const { cartId, itemId } = await params;
  const result = await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cart_id: cartId,
    },
  });

  if (result.count === 0) {
    return notFound('Cart item not found');
  }

  await prisma.cart.update({
    where: { id: cartId },
    data: { updated_at: new Date() },
  });

  return Response.json({ deleted: true });
}

function getBuyerSearchWhere(request: Request): Prisma.BuyerProfileWhereInput {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return {};
  }

  return {
    OR: [
      { id: { contains: query, mode: 'insensitive' } },
      { clerk_user_id: { contains: query, mode: 'insensitive' } },
      { first_name: { contains: query, mode: 'insensitive' } },
      { last_name: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
    ],
  };
}

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

function mapAddress(address: AddressShape) {
  return {
    id: address.id,
    buyerId: address.buyer_id,
    label: address.label,
    address: address.address,
    apartment: address.apartment,
    floor: address.floor,
    city: address.city,
    postalCode: address.postal_code,
    province: address.province,
    country: address.country,
    createdAt: address.created_at,
    updatedAt: address.updated_at,
  };
}

function mapCart(cart: CartShape) {
  const itemCount = cart.items.length;
  const totalQuantity = sumCartQuantity(cart.items);

  return {
    id: cart.id,
    buyerId: cart.buyer_id,
    buyer: cart.buyer ? mapBuyerIdentity(cart.buyer) : undefined,
    itemCount,
    totalQuantity,
    isEmpty: itemCount === 0,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
    lastItemActivityAt: getLastItemActivityAt(cart.items),
    items: cart.items.map(mapCartItem),
  };
}

function mapCartItem(item: CartItemShape) {
  return {
    id: item.id,
    cartId: item.cart_id,
    productId: item.product_id,
    quantity: item.quantity,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function isProfileComplete(buyer: Pick<BuyerIdentity, 'first_name' | 'last_name' | 'phone'>) {
  return Boolean(
    buyer.first_name?.trim() && buyer.last_name?.trim() && buyer.phone?.trim(),
  );
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
