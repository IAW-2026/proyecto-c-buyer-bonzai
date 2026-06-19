import { z } from 'zod';

const requiredString = (label: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined ? `${label} es obligatorio` : 'Valor invalido',
    })
    .trim()
    .min(1, { error: `${label} es obligatorio` });

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

export const checkoutShippingSchema = z.object({
  firstName: requiredString('El nombre'),
  lastName: requiredString('El apellido'),
  address: requiredString('La direccion'),
  apartment: optionalString,
  floor: optionalString,
  city: requiredString('La ciudad'),
  postalCode: requiredString('El codigo postal'),
  province: requiredString('La provincia'),
  phone: requiredString('El telefono'),
  country: z.literal('Argentina', {
    error: 'El pais o region debe ser Argentina',
  }),
});

export type CheckoutShippingDetails = z.infer<typeof checkoutShippingSchema>;

export const CHECKOUT_SHIPPING_STORAGE_KEY = 'bonzai.checkout.shipping.v2';
