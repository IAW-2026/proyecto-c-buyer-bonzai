import { z } from 'zod';

const optionalNullableText = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }

    return value;
  },
  z.string().nullable().optional(),
);

const optionalRequiredText = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().min(1).optional(),
);

export const buyerProfilePatchSchema = z
  .object({
    firstName: optionalNullableText,
    lastName: optionalNullableText,
    phone: optionalNullableText,
  })
  .refine(hasAtLeastOneDefinedValue, {
    message: 'At least one field is required',
  });

export const shippingAddressPatchSchema = z
  .object({
    label: optionalNullableText,
    address: optionalRequiredText,
    apartment: optionalNullableText,
    floor: optionalNullableText,
    city: optionalRequiredText,
    postalCode: optionalRequiredText,
    province: optionalRequiredText,
    country: z.literal('Argentina').optional(),
  })
  .refine(hasAtLeastOneDefinedValue, {
    message: 'At least one field is required',
  });

function hasAtLeastOneDefinedValue(data: Record<string, unknown>) {
  return Object.values(data).some((value) => value !== undefined);
}
