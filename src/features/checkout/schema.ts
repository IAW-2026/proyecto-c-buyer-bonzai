import { z } from 'zod';

const requiredString = (label: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined ? `${label} is required` : 'Invalid value',
    })
    .trim()
    .min(1, { error: `${label} is required` });

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

export const checkoutShippingSchema = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  address: requiredString('The address'),
  apartment: optionalString,
  floor: optionalString,
  city: requiredString('The city'),
  postalCode: requiredString('The postal code'),
  province: requiredString('The province'),
  country: z.literal('Argentina', {
    error: 'The country or region must be Argentina',
  }),
});

export type CheckoutShippingDetails = z.infer<typeof checkoutShippingSchema>;

export const CHECKOUT_SHIPPING_STORAGE_KEY = 'bonzai.checkout.shipping.v1';
