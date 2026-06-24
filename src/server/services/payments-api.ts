import 'server-only';

import { z } from 'zod';

const PAYMENTS_API_URL = 'https://proyecto-c-payments-bonzai.vercel.app';
const DEFAULT_PAYMENTS_CHECKOUT_PATH = '/api/payments/checkout';
const DEFAULT_PAYMENTS_API_KEY_HEADER = 'x-service-key';

const checkoutResponseSchema = z
  .object({
    transactionId: z.string(),
    checkoutUrl: z.string(),
    sandboxUrl: z.string(),
    status: z.string(),
  })
  .passthrough();

const disputeResponseSchema = z
  .object({
    success: z.boolean(),
    transactionId: z.string(),
    newStatus: z.string(),
    message: z.string().optional(),
  })
  .passthrough();

const paymentOrderStatusSchema = z
  .object({
    transactionId: z.string(),
    orderRef: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export type PaymentsCheckoutOrder = {
  sellerId: string;
  amount: number;
  orderRef: string;
};

export type PaymentsCheckoutPayload = {
  buyerId: string;
  buyerEmail?: string;
  orders: PaymentsCheckoutOrder[];
};

export type PaymentsDisputePayload = {
  reason: string;
  description: string;
};

export type PaymentOrderStatus = z.infer<typeof paymentOrderStatusSchema>;

export class PaymentsApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'PaymentsApiError';
  }
}

export async function createPaymentsCheckout(body: PaymentsCheckoutPayload) {
  console.info('Payments checkout request payload:', JSON.stringify(body));

  const payload = await paymentsFetch(getPaymentsCheckoutPath(), { body });
  const result = checkoutResponseSchema.parse(payload);

  console.info('Payments checkout response:', JSON.stringify(result));

  if (!isHttpUrl(result.sandboxUrl)) {
    throw new PaymentsApiError(
      'Payments no devolvio una sandboxUrl valida para continuar.',
    );
  }

  return {
    transactionId: result.transactionId,
    paymentUrl: result.sandboxUrl,
    status: result.status,
  };
}

export async function createPaymentDispute({
  orderId,
  reason,
  description,
}: PaymentsDisputePayload & { orderId: string }) {
  const payload = await paymentsFetch(
    `/api/payments/${encodeURIComponent(orderId)}/dispute`,
    {
      body: { reason, description },
    },
  );
  const result = disputeResponseSchema.parse(payload);

  if (!result.success) {
    throw new PaymentsApiError('Payments no pudo abrir la disputa.');
  }

  return {
    transactionId: result.transactionId,
    newStatus: result.newStatus,
  };
}

export async function getPaymentOrderStatus(
  orderId: string,
): Promise<PaymentOrderStatus> {
  const payload = await paymentsFetch(
    `/api/payments/orders/${encodeURIComponent(orderId)}/status`,
    { method: 'GET' },
  );

  return paymentOrderStatusSchema.parse(payload);
}

async function paymentsFetch(
  path: string,
  {
    method = 'POST',
    body,
  }: {
    method?: 'GET' | 'POST';
    body?: unknown;
  },
) {
  const url = paymentsUrl(path);
  const headers = new Headers();
  const apiKey = getPaymentsApiKey();

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set(getPaymentsApiKeyHeader(), apiKey);

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await readPaymentsPayload(response);

  if (!response.ok) {
    throw new PaymentsApiError(
      getPaymentsErrorMessage(payload, response),
      response.status,
    );
  }

  return payload;
}

function paymentsUrl(path: string) {
  const baseUrl = PAYMENTS_API_URL.replace(/\/+$/, '');

  return new URL(path.replace(/^\/+/, ''), `${baseUrl}/`);
}

function getPaymentsCheckoutPath() {
  return (
    process.env.PAYMENTS_CHECKOUT_PATH?.trim() || DEFAULT_PAYMENTS_CHECKOUT_PATH
  );
}

function getPaymentsApiKeyHeader() {
  return (
    process.env.PAYMENTS_API_KEY_HEADER?.trim() ||
    DEFAULT_PAYMENTS_API_KEY_HEADER
  );
}

function getPaymentsApiKey() {
  const apiKey = process.env.PAYMENTS_API_KEY?.trim();

  if (!apiKey) {
    throw new PaymentsApiError(
      'Missing PAYMENTS_API_KEY environment variable.',
    );
  }

  return apiKey;
}

async function readPaymentsPayload(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getPaymentsErrorMessage(payload: unknown, response: Response) {
  if (payload && typeof payload === 'object') {
    const message = 'message' in payload ? payload.message : undefined;
    const error = 'error' in payload ? payload.error : undefined;

    if (typeof message === 'string') {
      return message;
    }

    if (typeof error === 'string') {
      return error;
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  return response.statusText || 'Payments API request failed.';
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
