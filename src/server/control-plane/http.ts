import { timingSafeEqual } from 'node:crypto';
import type { z } from 'zod';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};

const BUYER_API_KEY_HEADER = 'x-api-key';

export async function requireBuyerApiKey(request: Request) {
  const configuredApiKey = process.env.BUYER_API_KEY;

  if (!configuredApiKey) {
    return Response.json(
      { error: 'Internal API key is not configured' },
      { status: 500 },
    );
  }

  const providedApiKey = request.headers.get(BUYER_API_KEY_HEADER);

  if (!providedApiKey || !isSafeEqual(providedApiKey, configuredApiKey)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

function isSafeEqual(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value);
  const expectedValueBuffer = Buffer.from(expectedValue);

  if (valueBuffer.length !== expectedValueBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedValueBuffer);
}

export function getPagination(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const requestedTake = parsePositiveInt(searchParams.get('take'), DEFAULT_PAGE_SIZE);
  const take = Math.min(requestedTake, MAX_PAGE_SIZE);

  return {
    page,
    take,
    skip: (page - 1) * take,
  };
}

export function getLimit(request: Request, defaultLimit = 10, maxLimit = 50) {
  const { searchParams } = new URL(request.url);
  const requestedLimit = parsePositiveInt(searchParams.get('limit'), defaultLimit);

  return Math.min(requestedLimit, maxLimit);
}

export function getDateRange(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = parseDateParam(searchParams.get('from'), 'from');

  if (!from.ok) {
    return { response: badRequest(from.message) };
  }

  const to = parseDateParam(searchParams.get('to'), 'to');

  if (!to.ok) {
    return { response: badRequest(to.message) };
  }

  if (from.date && to.date && from.date > to.date) {
    return { response: badRequest('from must be before to') };
  }

  return {
    from: from.date,
    to: to.date,
  };
}

export async function parseJsonBody(request: Request) {
  try {
    return { data: (await request.json()) as unknown };
  } catch {
    return { response: badRequest('Invalid JSON body') };
  }
}

export function badRequest(message: string, details?: unknown) {
  return Response.json(
    {
      error: message,
      ...(details === undefined ? {} : { details }),
    },
    { status: 400 },
  );
}

export function notFound(message = 'Resource not found') {
  return Response.json({ error: message }, { status: 404 });
}

export function validationError(error: z.ZodError) {
  return badRequest('Validation failed', error.flatten().fieldErrors);
}

export function rate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(4));
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseDateParam(value: string | null, label: string) {
  if (!value) {
    return { ok: true as const, date: null };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { ok: false as const, message: `${label} must be a valid date` };
  }

  return { ok: true as const, date };
}
