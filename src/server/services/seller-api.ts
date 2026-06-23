import { z } from 'zod';
import type { Product, ProductCategory } from '@/features/shop/types';

const SELLER_API_URL = 'https://proyecto-c-seller-bonzai.vercel.app';

const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .strict();

const sellerSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    approved: z.boolean().optional(),
    suspended: z.boolean().optional(),
  })
  .strict();

const sellerProductSchema = z
  .object({
    id: z.string(),
    sellerId: z.string(),
    categoryId: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    stock: z.number().int(),
    isActive: z.boolean(),
    imageUrl: z.string().nullable(),
    isFragile: z.boolean(),
    suspended: z.boolean(),
    moderationStatus: z.string(),
    moderationNote: z.string().nullable(),
    slug: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    category: categorySchema.nullable(),
    seller: sellerSchema,
  })
  .strict();

const productsBrowseSchema = z
  .object({
    products: z.array(sellerProductSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  })
  .strict();

const productDetailSchema = z
  .object({
    product: sellerProductSchema,
  })
  .strict();

const categoriesResponseSchema = z
  .object({
    categories: z.array(categorySchema),
  })
  .strict();

const reservationsResponseSchema = z
  .object({
    success: z.boolean(),
    reservationIds: z.array(z.string()),
  })
  .strict();

const purchaseOrderItemSchema = z
  .object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().int(),
    price: z.number(),
  })
  .strict();

const purchaseOrderSchema = z
  .object({
    orderId: z.string(),
    sellerId: z.string(),
    status: z.string(),
    total: z.number(),
    createdAt: z.string(),
    trackingId: z.string().nullable(),
    items: z.array(purchaseOrderItemSchema),
  })
  .strict();

const purchaseSchema = z
  .object({
    purchaseId: z.string(),
    status: z.literal('COMPLETED'),
    createdAt: z.string(),
    orders: z.array(purchaseOrderSchema),
  })
  .strict();

const purchasesResponseSchema = z
  .object({
    purchases: z.array(purchaseSchema),
  })
  .strict();

const createdOrderSchema = z.object({
  orderId: z.string(),
  sellerId: z.string(),
  subtotal: z.number(),
});

const createOrdersResponseSchema = z.object({
  success: z.boolean(),
  orders: z.array(createdOrderSchema),
});

export type BuyerPurchase = z.infer<typeof purchaseSchema>;
export type BuyerPurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type BuyerPurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
export type CreateSellerOrdersResult = z.infer<
  typeof createOrdersResponseSchema
>;

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

  return {
    products: result.products,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function getSellerProductById(id: string) {
  try {
    const payload = await sellerFetch(
      `/api/products/browse/${encodeURIComponent(id)}`,
    );
    const result = productDetailSchema.parse(payload);

    return result.product;
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

export async function createSellerOrders(
  body: SellerOrderPayload,
): Promise<CreateSellerOrdersResult> {
  const payload = await sellerFetch('/api/orders/new', {
    method: 'POST',
    serviceKey: true,
    body,
  });

  const result = createOrdersResponseSchema.parse(payload);

  if (!result.success) {
    throw new SellerApiError('Seller could not create the order.');
  }

  return result;
}

export async function getBuyerPurchases(
  buyerId: string,
): Promise<BuyerPurchase[]> {
  const payload = await sellerFetch('/api/purchases', {
    query: { buyerId },
    serviceKey: true,
  });
  const result = purchasesResponseSchema.parse(payload);

  return result.purchases;
}

export async function cancelSellerReservation(reservationId: string) {
  await sellerFetch(`/api/reservations/${encodeURIComponent(reservationId)}`, {
    method: 'DELETE',
    serviceKey: true,
  });
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
  const baseUrl = SELLER_API_URL.replace(/\/+$/, '');

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
