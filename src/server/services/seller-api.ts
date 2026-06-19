import { z } from 'zod';
import type { Product, ProductCategory } from '@/features/shop/types';

const DEFAULT_SELLER_API_URL = 'https://proyecto-c-seller-bonzai.vercel.app';
const PRODUCT_IMAGE_PLACEHOLDER = '/images/product-placeholder.svg';

const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

const sellerSchema = z
  .object({
    id: z.string(),
    email: z.string().optional(),
  })
  .passthrough();

const sellerProductSchema = z
  .object({
    id: z.string(),
    sellerId: z.string().optional(),
    seller_id: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    category_id: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    name: z.string(),
    description: z.string().nullable().optional(),
    price: z.coerce.number(),
    stock: z.coerce.number().int(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    isFragile: z.boolean().optional(),
    is_fragile: z.boolean().optional(),
    category: categorySchema.nullable().optional(),
    seller: sellerSchema.nullable().optional(),
  })
  .passthrough();

const productsBrowseSchema = z.object({
  products: z.array(sellerProductSchema),
  total: z.coerce.number(),
  page: z.coerce.number(),
  limit: z.coerce.number(),
});

const productDetailSchema = z.object({
  product: sellerProductSchema,
});

const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

const reservationsResponseSchema = z.object({
  success: z.boolean(),
  reservationIds: z.array(z.string()),
});

const ordersResponseSchema = z.object({
  success: z.boolean(),
  orderIds: z.array(z.string()),
});

const orderItemSchema = z
  .object({
    id: z.string().optional(),
    productId: z.string().optional(),
    product_id: z.string().optional(),
    productName: z.string().optional(),
    product_name: z.string().optional(),
    unitPrice: z.coerce.number().optional(),
    unit_price: z.coerce.number().optional(),
    quantity: z.coerce.number().int(),
    subtotal: z.coerce.number().optional(),
  })
  .passthrough();

const orderSchema = z
  .object({
    orderId: z.string().optional(),
    id: z.string().optional(),
    status: z.string(),
    total: z.coerce.number(),
    createdAt: z.string(),
    items: z.array(orderItemSchema).default([]),
    trackingId: z.string().nullable().optional(),
  })
  .passthrough();

const ordersListSchema = z.object({
  orders: z.array(orderSchema),
});

type SellerProduct = z.infer<typeof sellerProductSchema>;
type SellerOrder = z.infer<typeof orderSchema>;
type SellerOrderItem = z.infer<typeof orderItemSchema>;

export type ProductBrowseResult = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export type SellerCartReservationItem = {
  productId: string;
  quantity: number;
  sellerId: string;
};

export type SellerOrderPayload = {
  buyerId: string;
  reservationIds: string[];
  status: 'PENDING';
  shippingName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip: string;
  shippingPhone: string;
};

export type BuyerOrder = {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  trackingId: string | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
};

export class SellerApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'SellerApiError';
  }
}

export async function browseSellerProducts({
  search,
  categoryId,
  page = 1,
  limit = 20,
}: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ProductBrowseResult> {
  const payload = await sellerFetch('/api/products/browse', {
    query: {
      search,
      categoryId,
      page: String(page),
      limit: String(limit),
    },
  });
  const result = productsBrowseSchema.parse(payload);

  console.log(result.products);

  return {
    products: result.products.map(mapSellerProduct),
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function getSellerProductById(id: string) {
  try {
    const payload = await sellerFetch(`/api/products/browse/${encodeURIComponent(id)}`);
    const result = productDetailSchema.parse(payload);

    return mapSellerProduct(result.product);
  } catch (error) {
    if (error instanceof SellerApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getSellerCategories(): Promise<ProductCategory[]> {
  const payload = await sellerFetch('/api/categories');
  const result = categoriesResponseSchema.parse(payload);

  return result.categories.sort((current, next) =>
    current.name.localeCompare(next.name),
  );
}

export async function createSellerReservations({
  buyerId,
  items,
}: {
  buyerId: string;
  items: SellerCartReservationItem[];
}) {
  const payload = await sellerFetch('/api/reservations/bulk', {
    method: 'POST',
    serviceKey: true,
    body: { buyerId, items },
  });
  const result = reservationsResponseSchema.parse(payload);

  if (!result.success) {
    throw new SellerApiError('Seller could not reserve the selected stock.');
  }

  return result.reservationIds;
}

export async function createSellerOrders(body: SellerOrderPayload) {
  const payload = await sellerFetch('/api/orders/new', {
    method: 'POST',
    serviceKey: true,
    body,
  });
  const result = ordersResponseSchema.parse(payload);

  if (!result.success) {
    throw new SellerApiError('Seller could not create the order.');
  }

  return result.orderIds;
}

export async function cancelSellerReservation(reservationId: string) {
  await sellerFetch(`/api/reservations/${encodeURIComponent(reservationId)}`, {
    method: 'DELETE',
    serviceKey: true,
  });
}

export async function getBuyerOrders(buyerId: string): Promise<BuyerOrder[]> {
  const payload = await sellerFetch('/api/orders/my', {
    serviceKey: true,
    query: { buyerId },
  });
  const result = ordersListSchema.parse(payload);

  return result.orders.map(mapBuyerOrder);
}

async function sellerFetch(
  path: string,
  {
    method = 'GET',
    query,
    body,
    serviceKey = false,
  }: {
    method?: 'GET' | 'POST' | 'DELETE';
    query?: Record<string, string | undefined>;
    body?: unknown;
    serviceKey?: boolean;
  } = {},
) {
  const url = sellerUrl(path);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value?.trim()) {
      url.searchParams.set(key, value.trim());
    }
  }

  const headers = new Headers();

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (serviceKey) {
    headers.set('x-service-key', getSellerApiKey());
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SellerApiError(await readSellerError(response), response.status);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function sellerUrl(path: string) {
  const baseUrl = (
    process.env.SELLER_API_URL?.trim() || DEFAULT_SELLER_API_URL
  ).replace(/\/+$/, '');

  return new URL(path.replace(/^\/+/, ''), `${baseUrl}/`);
}

function getSellerApiKey() {
  const apiKey = process.env.SELLER_API_KEY?.trim();

  if (!apiKey) {
    throw new SellerApiError('Missing SELLER_API_KEY environment variable.');
  }

  return apiKey;
}

async function readSellerError(response: Response) {
  try {
    const payload = await response.json();

    if (typeof payload?.message === 'string') {
      return payload.message;
    }

    if (typeof payload?.error === 'string') {
      return payload.error;
    }
  } catch {
    // Fall through to the status text when Seller does not return JSON.
  }

  return response.statusText || 'Seller API request failed.';
}

function mapSellerProduct(product: SellerProduct): Product {
  const sellerId = product.sellerId ?? product.seller_id ?? product.seller?.id;

  if (!sellerId) {
    throw new SellerApiError(`Product ${product.id} is missing seller id.`);
  }

  const categoryId =
    product.categoryId ?? product.category_id ?? product.category?.id ?? null;
  const categoryName = product.category?.name ?? 'Uncategorized';
  const isFragile = product.isFragile ?? product.is_fragile ?? false;
  const imageUrl = product.imageUrl ?? product.image_url ?? PRODUCT_IMAGE_PLACEHOLDER;

  return {
    id: product.id,
    sellerId,
    sellerEmail: product.seller?.email ?? null,
    categoryId,
    category: categoryName,
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    stock: product.stock,
    isActive: product.isActive ?? product.is_active ?? true,
    isFragile,
    careLabel: isFragile ? 'Fragile handling' : 'Standard handling',
    tags: isFragile ? [categoryName, 'Fragile'] : [categoryName],
    imageAspect: 'portrait',
    image: {
      src: imageUrl,
      alt: `${product.name} product photo`,
    },
  };
}

function mapBuyerOrder(order: SellerOrder): BuyerOrder {
  const orderId = order.orderId ?? order.id;

  if (!orderId) {
    throw new SellerApiError('Order response is missing order id.');
  }

  return {
    orderId,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    trackingId: order.trackingId ?? null,
    items: order.items.map((item, index) => mapBuyerOrderItem(item, index)),
  };
}

function mapBuyerOrderItem(item: SellerOrderItem, index: number) {
  const productId = item.productId ?? item.product_id ?? `product-${index + 1}`;
  const productName = item.productName ?? item.product_name ?? 'Product';
  const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
  const subtotal = item.subtotal ?? unitPrice * item.quantity;

  return {
    id: item.id ?? `${productId}-${index + 1}`,
    productId,
    productName,
    unitPrice,
    quantity: item.quantity,
    subtotal,
  };
}
