'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CHECKOUT_SHIPPING_STORAGE_KEY,
  checkoutShippingSchema,
  type CheckoutShippingDetails,
} from '../schema';

type CheckoutFormProps = {
  isCartEmpty: boolean;
};

type FieldErrors = Partial<Record<keyof CheckoutShippingDetails, string[]>>;

const emptyShippingDetails: CheckoutShippingDetails = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  floor: '',
  city: '',
  postalCode: '',
  province: '',
  phone: '',
  country: 'Argentina',
};

export function CheckoutForm({ isCartEmpty }: CheckoutFormProps) {
  const router = useRouter();
  const [shippingDetails, setShippingDetails] = useState(emptyShippingDetails);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const storedDetails = sessionStorage.getItem(CHECKOUT_SHIPPING_STORAGE_KEY);

    if (!storedDetails) {
      return;
    }

    try {
      const result = checkoutShippingSchema.safeParse(
        JSON.parse(storedDetails),
      );

      if (result.success) {
        queueMicrotask(() => setShippingDetails(result.data));
      }
    } catch {
      sessionStorage.removeItem(CHECKOUT_SHIPPING_STORAGE_KEY);
    }
  }, []);

  function updateField(name: keyof CheckoutShippingDetails, value: string) {
    setShippingDetails((currentDetails) => ({
      ...currentDetails,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCartEmpty) {
      setFormError(
        'Tu carrito esta vacio. Agrega al menos una planta antes de completar el pedido.',
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const result = checkoutShippingSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      address: formData.get('address'),
      apartment: formData.get('apartment'),
      floor: formData.get('floor'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode'),
      province: formData.get('province'),
      phone: formData.get('phone'),
      country: formData.get('country'),
    });

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      setFormError('Revisa los campos marcados para continuar.');
      const firstInvalidField = findFirstInvalidField(
        result.error.flatten().fieldErrors,
      );
      requestAnimationFrame(() => {
        if (firstInvalidField) {
          document.getElementById(firstInvalidField)?.focus();
        }
      });
      return;
    }

    setFieldErrors({});
    setFormError('');
    sessionStorage.setItem(
      CHECKOUT_SHIPPING_STORAGE_KEY,
      JSON.stringify(result.data),
    );
    router.push('/checkout/review');
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div
          className="bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre"
          name="firstName"
          value={shippingDetails.firstName}
          error={fieldErrors.firstName?.[0]}
          autoComplete="given-name"
          onChange={updateField}
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={shippingDetails.lastName}
          error={fieldErrors.lastName?.[0]}
          autoComplete="family-name"
          onChange={updateField}
        />
        <TextField
          className="sm:col-span-2"
          label="Direccion de envio"
          name="address"
          value={shippingDetails.address}
          error={fieldErrors.address?.[0]}
          autoComplete="street-address"
          onChange={updateField}
        />
        <TextField
          label="Departamento / unidad"
          name="apartment"
          value={shippingDetails.apartment ?? ''}
          error={fieldErrors.apartment?.[0]}
          autoComplete="address-line2"
          optional
          onChange={updateField}
        />
        <TextField
          label="Piso"
          name="floor"
          value={shippingDetails.floor ?? ''}
          error={fieldErrors.floor?.[0]}
          optional
          onChange={updateField}
        />
        <TextField
          label="Ciudad"
          name="city"
          value={shippingDetails.city}
          error={fieldErrors.city?.[0]}
          autoComplete="address-level2"
          onChange={updateField}
        />
        <TextField
          label="Codigo postal"
          name="postalCode"
          value={shippingDetails.postalCode}
          error={fieldErrors.postalCode?.[0]}
          autoComplete="postal-code"
          onChange={updateField}
        />
        <TextField
          label="Provincia"
          name="province"
          value={shippingDetails.province}
          error={fieldErrors.province?.[0]}
          autoComplete="address-level1"
          onChange={updateField}
        />
        <TextField
          label="Telefono"
          name="phone"
          value={shippingDetails.phone}
          error={fieldErrors.phone?.[0]}
          autoComplete="tel"
          onChange={updateField}
        />
        <TextField
          label="Pais / region"
          name="country"
          value={shippingDetails.country}
          error={fieldErrors.country?.[0]}
          autoComplete="country-name"
          readOnly
          onChange={updateField}
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-8 py-4 text-center font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
      >
        Completar pedido
      </button>
    </form>
  );
}

type TextFieldProps = {
  label: string;
  name: keyof CheckoutShippingDetails;
  value: string;
  error?: string;
  optional?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  className?: string;
  onChange: (name: keyof CheckoutShippingDetails, value: string) => void;
};

function TextField({
  label,
  name,
  value,
  error,
  optional,
  readOnly,
  autoComplete,
  className,
  onChange,
}: TextFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-2 flex items-center justify-between gap-3 font-label text-xs uppercase tracking-[0.16em] text-secondary"
      >
        <span>{label}</span>
        {optional ? (
          <span className="normal-case tracking-normal">Opcional</span>
        ) : null}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        className="w-full rounded-sm bg-surface-container-high px-4 py-3 text-base text-primary transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary read-only:text-secondary"
      />
      {error ? (
        <p
          id={errorId}
          className="mt-2 text-sm font-medium text-tertiary"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function findFirstInvalidField(fieldErrors: FieldErrors) {
  const fieldOrder = [
    'firstName',
    'lastName',
    'address',
    'apartment',
    'floor',
    'city',
    'postalCode',
    'province',
    'phone',
    'country',
  ] satisfies Array<keyof CheckoutShippingDetails>;

  return fieldOrder.find((fieldName) => fieldErrors[fieldName]?.length);
}
