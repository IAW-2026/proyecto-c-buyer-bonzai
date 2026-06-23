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
  (value) =>
    typeof value !== 'string' || value.trim() === '' ? undefined : value,
  z.string().trim().optional(),
);

export const checkoutBuyerProfileSchema = z.object({
  firstName: requiredString('El nombre'),
  lastName: requiredString('El apellido'),
  phone: requiredString('El telefono'),
});

export const checkoutShippingAddressSchema = z.object({
  label: optionalString,
  address: requiredString('La direccion'),
  apartment: optionalString,
  floor: optionalString,
  city: requiredString('The city'),
  postalCode: requiredString('The postal code'),
  province: requiredString('The province'),
  country: z.literal('Argentina', {
    error: 'The country or region must be Argentina',
  }),
});

export const checkoutAddressSelectionSchema = z.object({
  addressId: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Selecciona una direccion para continuar.'
          : 'Selecciona una direccion valida.',
    })
    .trim()
    .uuid({ error: 'Selecciona una direccion valida.' }),
});

export type CheckoutBuyerProfileInput = z.infer<
  typeof checkoutBuyerProfileSchema
>;
export type CheckoutShippingAddressInput = z.infer<
  typeof checkoutShippingAddressSchema
>;
