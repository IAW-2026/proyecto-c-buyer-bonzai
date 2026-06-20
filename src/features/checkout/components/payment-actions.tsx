'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useCart } from '@/features/cart/components/cart-provider';
import { confirmCheckoutPendingOrders } from '@/features/checkout/actions/checkout';
import {
  CHECKOUT_SHIPPING_STORAGE_KEY,
  checkoutShippingSchema,
} from '@/features/checkout/schema';

export function PaymentActions() {
  const router = useRouter();
  const { dispatchCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isPending || isRedirecting;

  function confirmPendingOrder() {
    setError(null);

    startTransition(async () => {
      const shippingDetails = readStoredShippingDetails();

      if (!shippingDetails) {
        setError(
          'Necesitamos tus datos de envio antes de confirmar el pedido.',
        );
        return;
      }

      try {
        const result = await confirmCheckoutPendingOrders(shippingDetails);

        if (!result.success) {
          setError(result.message);
          return;
        }

        sessionStorage.removeItem(CHECKOUT_SHIPPING_STORAGE_KEY);
        dispatchCart({ type: 'set', quantity: 0 });
        setIsRedirecting(true);
        window.location.assign(result.paymentUrl);
      } catch {
        setIsRedirecting(false);
        setError(
          'No pudimos iniciar el pago. Intentalo nuevamente.',
        );
      }
    });
  }

  function returnToReview() {
    router.push('/checkout/review');
  }

  return (
    <div className="mt-10">
      {error ? (
        <p className="mb-4 text-sm font-medium leading-6 text-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={confirmPendingOrder}
          disabled={isBusy}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'Preparando pago...' : 'Pagar con Mercado Pago'}
        </button>
        <button
          type="button"
          onClick={returnToReview}
          disabled={isBusy}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-surface-container-high px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Volver a revisar
        </button>
      </div>
    </div>
  );
}

function readStoredShippingDetails() {
  const storedDetails = sessionStorage.getItem(CHECKOUT_SHIPPING_STORAGE_KEY);

  if (!storedDetails) {
    return null;
  }

  try {
    const result = checkoutShippingSchema.safeParse(JSON.parse(storedDetails));

    return result.success ? result.data : null;
  } catch {
    sessionStorage.removeItem(CHECKOUT_SHIPPING_STORAGE_KEY);
    return null;
  }
}
