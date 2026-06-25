import Link from 'next/link';
import type { CartViewModel } from '@/features/cart/types';
import {
  formatShippingAddress,
  type CheckoutShippingSelection,
} from '@/features/checkout/data/shipping';
import { OrderSummary } from './order-summary';

type CheckoutReviewProps = {
  cart: CartViewModel;
  shipping: CheckoutShippingSelection;
};

export function CheckoutReview({ cart, shipping }: CheckoutReviewProps) {
  const paymentHref = `/checkout/payment?addressId=${shipping.address.id}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section
        className="bg-surface-container-lowest p-6 sm:p-8"
        aria-labelledby="shipping-review-title"
      >
        <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Delivery address
        </p>
        <h2
          id="shipping-review-title"
          className="mt-4 font-headline text-4xl leading-none tracking-[-0.04em] text-primary"
        >
          Review the information before paying.
        </h2>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <Detail
            label="Nombre"
            value={`${shipping.profile.firstName} ${shipping.profile.lastName}`}
          />
          <Detail label="Telefono" value={shipping.profile.phone} />
          <Detail
            label="Referencia"
            value={shipping.address.label || 'No indicada'}
          />
          <Detail
            label="Direccion"
            value={formatShippingAddress(shipping.address)}
          />
          <Detail label="Ciudad" value={shipping.address.city} />
          <Detail label="Codigo postal" value={shipping.address.postalCode} />
          <Detail label="Provincia" value={shipping.address.province} />
          <Detail label="Pais / region" value={shipping.address.country} />
        </dl>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={paymentHref}
            className="inline-flex items-center justify-center rounded-sm bg-[linear-gradient(135deg,#03271a,#1b3d2f)] px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:opacity-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Confirmar pedido
          </Link>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-sm bg-surface-container-high px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cambiar direccion
          </Link>
        </div>
      </section>

      <OrderSummary cart={cart} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low px-4 py-4">
      <dt className="font-label text-[11px] uppercase tracking-[0.16em] text-secondary">
        {label}
      </dt>
      <dd className="mt-2 text-base font-medium text-primary">{value}</dd>
    </div>
  );
}
