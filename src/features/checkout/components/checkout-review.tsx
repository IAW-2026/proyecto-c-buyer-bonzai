'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartViewModel } from '@/features/cart/types';
import { OrderSummary } from './order-summary';
import {
  CHECKOUT_SHIPPING_STORAGE_KEY,
  checkoutShippingSchema,
  type CheckoutShippingDetails,
} from '../schema';

type CheckoutReviewProps = {
  cart: CartViewModel;
};

export function CheckoutReview({ cart }: CheckoutReviewProps) {
  const [shippingDetails, setShippingDetails] = useState<CheckoutShippingDetails | null>(null);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem(CHECKOUT_SHIPPING_STORAGE_KEY);

    if (!storedDetails) {
      queueMicrotask(() => setStorageError(true));
      return;
    }

    try {
      const result = checkoutShippingSchema.safeParse(JSON.parse(storedDetails));

      if (result.success) {
        queueMicrotask(() => setShippingDetails(result.data));
      } else {
        queueMicrotask(() => setStorageError(true));
      }
    } catch {
      queueMicrotask(() => setStorageError(true));
    }
  }, []);

  if (storageError) {
    return (
      <section className="bg-surface-container-lowest p-8 sm:p-10" role="status">
        <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Missing data
        </p>
        <h2 className="mt-4 font-headline text-4xl leading-none tracking-[-0.04em] text-primary">
          We need your shipping information.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-7 text-secondary">
          Go back to checkout and complete the address before reviewing your order.
        </p>
        <Link
          href="/checkout"
          className="mt-8 inline-flex rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Complete shipping
        </Link>
      </section>
    );
  }

  if (!shippingDetails) {
    return (
      <section className="bg-surface-container-lowest p-8 text-sm text-secondary" role="status">
        Loading order details...
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section className="bg-surface-container-lowest p-6 sm:p-8" aria-labelledby="shipping-review-title">
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
          <Detail label="Name" value={`${shippingDetails.firstName} ${shippingDetails.lastName}`} />
          <Detail label="Address" value={shippingDetails.address} />
          <Detail label="Apartment / unit" value={shippingDetails.apartment || 'Not indicated'} />
          <Detail label="Floor" value={shippingDetails.floor || 'Not indicated'} />
          <Detail label="City" value={shippingDetails.city} />
          <Detail label="Postal code" value={shippingDetails.postalCode} />
          <Detail label="Province" value={shippingDetails.province} />
          <Detail label="Country / region" value={shippingDetails.country} />
        </dl>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/checkout/payment"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go to payment
          </Link>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-sm bg-surface-container-high px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Edit shipping
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
