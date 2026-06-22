'use client';

import { useActionState, type ReactNode } from 'react';
import {
  createCheckoutShippingAddress,
  saveCheckoutBuyerProfile,
  updateCheckoutShippingAddress,
  type CheckoutBuyerProfileState,
  type CheckoutShippingAddressState,
} from '@/features/checkout/actions/checkout';
import type {
  CheckoutBuyerProfileInput,
  CheckoutShippingAddressInput,
} from '@/features/checkout/schema';
import type {
  CheckoutBuyerProfile,
  CheckoutShippingAddress,
} from '@/features/checkout/data/shipping';

type CheckoutFormProps = {
  profile: CheckoutBuyerProfile;
  addresses: CheckoutShippingAddress[];
};

const initialBuyerProfileState: CheckoutBuyerProfileState = {
  status: 'idle',
  submissionId: 0,
  message: '',
  fieldErrors: {},
};

const initialShippingAddressState: CheckoutShippingAddressState = {
  status: 'idle',
  submissionId: 0,
  message: '',
  fieldErrors: {},
};

export function CheckoutForm({ profile, addresses }: CheckoutFormProps) {
  if (!profile.isComplete) {
    return <BuyerProfileForm profile={profile} />;
  }

  if (addresses.length === 0) {
    return (
      <div className="space-y-8">
        <IntroBlock
          eyebrow="Primera entrega"
          title="Guardemos tu primera direccion."
          description="La vamos a guardar en tu cuenta para que el proximo pedido sea mas rapido y consistente."
        />
        <ShippingAddressForm submitLabel="Guardar y revisar pedido" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <IntroBlock
        eyebrow="Entrega"
        title="Elegi donde recibir el pedido."
        description="Tus datos personales ya estan guardados. Ahora selecciona una direccion o agrega una nueva para esta compra."
      />

      <AddressSelector addresses={addresses} />

      <details className="group bg-surface-container-low p-5 transition open:bg-surface-container sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-label text-xs uppercase tracking-[0.16em] text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary">
          Agregar otra direccion
          <span className="grid size-8 place-items-center rounded-full bg-surface-container-high text-lg leading-none transition group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="mt-6">
          <ShippingAddressForm submitLabel="Guardar y revisar con esta direccion" />
        </div>
      </details>
    </div>
  );
}

function BuyerProfileForm({ profile }: { profile: CheckoutBuyerProfile }) {
  const [state, formAction, isPending] = useActionState(
    saveCheckoutBuyerProfile,
    initialBuyerProfileState,
  );

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <IntroBlock
        eyebrow="Datos del comprador"
        title="Tus datos se cargan una sola vez."
        description="Nombre, apellido y telefono quedan guardados en tu perfil de Bonzai. Las direcciones se administran aparte para que puedas tener varias opciones de envio."
      />

      {state.status === 'error' ? (
        <FormError message={state.message} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre"
          name="firstName"
          defaultValue={profile.firstName}
          error={state.fieldErrors.firstName?.[0]}
          autoComplete="given-name"
        />
        <TextField
          label="Apellido"
          name="lastName"
          defaultValue={profile.lastName}
          error={state.fieldErrors.lastName?.[0]}
          autoComplete="family-name"
        />
        <TextField
          className="sm:col-span-2"
          label="Telefono"
          name="phone"
          defaultValue={profile.phone}
          error={state.fieldErrors.phone?.[0]}
          autoComplete="tel"
        />
      </div>

      <PrimaryButton disabled={isPending} pendingLabel="Guardando...">
        Guardar datos
      </PrimaryButton>
    </form>
  );
}

function AddressSelector({ addresses }: { addresses: CheckoutShippingAddress[] }) {
  const selectionFormId = 'checkout-address-selection';

  return (
    <div className="space-y-6">
      <div
        className="grid gap-4"
        role="radiogroup"
        aria-label="Direcciones guardadas"
      >
        {addresses.map((address, index) => (
          <article
            key={address.id}
            className="group bg-surface-container-low p-5 transition hover:bg-surface-container sm:p-6 has-[:checked]:bg-surface-container-lowest"
          >
            <label className="grid cursor-pointer grid-cols-[auto,1fr] gap-4">
              <input
                type="radio"
                form={selectionFormId}
                name="addressId"
                value={address.id}
                defaultChecked={index === 0}
                required
                className="mt-1 size-4 accent-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
              />
              <span>
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-headline text-2xl leading-none tracking-[-0.03em] text-primary">
                    {address.label || `Direccion ${index + 1}`}
                  </span>
                  <span className="font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
                    {address.city}, {address.province}
                  </span>
                </span>
                <span className="mt-3 block text-sm leading-7 text-secondary">
                  {formatAddressLine(address)}
                </span>
                <span className="mt-2 block text-xs leading-5 text-secondary">
                  CP {address.postalCode} · {address.country}
                </span>
              </span>
            </label>

            <details className="mt-5 bg-surface-container p-4 transition open:bg-surface-container-high sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-label text-[10px] uppercase tracking-[0.18em] text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary">
                Editar direccion
                <span className="text-base leading-none transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-5">
                <EditShippingAddressForm address={address} />
              </div>
            </details>
          </article>
        ))}
      </div>

      <form id={selectionFormId} action="/checkout/review" method="get">
        <PrimaryButton pendingLabel="Continuando...">Revisar pedido</PrimaryButton>
      </form>
    </div>
  );
}

function ShippingAddressForm({ submitLabel }: { submitLabel: string }) {
  const [state, formAction, isPending] = useActionState(
    createCheckoutShippingAddress,
    initialShippingAddressState,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === 'error' ? (
        <FormError message={state.message} />
      ) : null}

      <ShippingAddressFields state={state} />

      <PrimaryButton disabled={isPending} pendingLabel="Guardando...">
        {submitLabel}
      </PrimaryButton>
    </form>
  );
}

function EditShippingAddressForm({
  address,
}: {
  address: CheckoutShippingAddress;
}) {
  const [state, formAction, isPending] = useActionState(
    updateCheckoutShippingAddress,
    initialShippingAddressState,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="addressId" value={address.id} />

      {state.status === 'error' ? (
        <FormError message={state.message} />
      ) : null}

      <ShippingAddressFields address={address} state={state} />

      <PrimaryButton disabled={isPending} pendingLabel="Guardando...">
        Guardar cambios
      </PrimaryButton>
    </form>
  );
}

function ShippingAddressFields({
  address,
  state,
}: {
  address?: CheckoutShippingAddress;
  state: CheckoutShippingAddressState;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Nombre de referencia"
        name="label"
        defaultValue={address?.label}
        error={state.fieldErrors.label?.[0]}
        placeholder="Casa, trabajo, vivero..."
        optional
      />
      <TextField
        className="sm:col-span-2"
        label="Direccion de envio"
        name="address"
        defaultValue={address?.address}
        error={state.fieldErrors.address?.[0]}
        autoComplete="street-address"
      />
      <TextField
        label="Departamento / unidad"
        name="apartment"
        defaultValue={address?.apartment}
        error={state.fieldErrors.apartment?.[0]}
        autoComplete="address-line2"
        optional
      />
      <TextField
        label="Piso"
        name="floor"
        defaultValue={address?.floor}
        error={state.fieldErrors.floor?.[0]}
        optional
      />
      <TextField
        label="Ciudad"
        name="city"
        defaultValue={address?.city}
        error={state.fieldErrors.city?.[0]}
        autoComplete="address-level2"
      />
      <TextField
        label="Codigo postal"
        name="postalCode"
        defaultValue={address?.postalCode}
        error={state.fieldErrors.postalCode?.[0]}
        autoComplete="postal-code"
      />
      <TextField
        label="Provincia"
        name="province"
        defaultValue={address?.province}
        error={state.fieldErrors.province?.[0]}
        autoComplete="address-level1"
      />
      <TextField
        label="Pais / region"
        name="country"
        defaultValue={address?.country ?? 'Argentina'}
        error={state.fieldErrors.country?.[0]}
        autoComplete="country-name"
        readOnly
      />
    </div>
  );
}

function IntroBlock({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-headline text-4xl leading-none tracking-[-0.04em] text-primary sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-sm leading-7 text-secondary">{description}</p>
    </div>
  );
}

type TextFieldName =
  | keyof CheckoutBuyerProfileInput
  | keyof CheckoutShippingAddressInput;

type TextFieldProps = {
  label: string;
  name: TextFieldName;
  defaultValue?: string | null;
  error?: string;
  optional?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
};

function TextField({
  label,
  name,
  defaultValue,
  error,
  optional,
  readOnly,
  autoComplete,
  placeholder,
  className,
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
        defaultValue={defaultValue ?? ''}
        readOnly={readOnly}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-sm bg-surface-container-high px-4 py-3 text-base text-primary transition placeholder:text-outline focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary read-only:text-secondary"
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

function PrimaryButton({
  children,
  disabled = false,
  pendingLabel,
}: {
  children: ReactNode;
  disabled?: boolean;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center rounded-sm bg-[linear-gradient(135deg,#03271a,#1b3d2f)] px-8 py-4 text-center font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {disabled ? pendingLabel : children}
    </button>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div
      className="bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary"
      role="alert"
    >
      {message}
    </div>
  );
}

function formatAddressLine(address: CheckoutShippingAddress) {
  return [
    address.address,
    address.apartment ? `Depto ${address.apartment}` : null,
    address.floor ? `Piso ${address.floor}` : null,
  ]
    .filter(Boolean)
    .join(', ');
}
