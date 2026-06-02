'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { clearCart } from '@/features/cart/actions/cart';
import { useCart } from '@/features/cart/components/cart-provider';

export function PaymentActions() {
  const router = useRouter();
  const { dispatchCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function finishSuccessfulPayment() {
    setError(null);

    startTransition(async () => {
      try {
        await clearCart();
        dispatchCart({ type: 'set', quantity: 0 });
        router.push('/?payment=success');
      } catch {
        setError(
          'We couldn\'t confirm the payment because the cart couldn\'t be cleared. Try again.',
        );
      }
    });
  }

  function finishFailedPayment() {
    router.push('/?payment=error');
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
          onClick={finishSuccessfulPayment}
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Confirming...' : 'Simulate success'}
        </button>
        <button
          type="button"
          onClick={finishFailedPayment}
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-surface-container-high px-8 py-4 font-label text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Simulate error
        </button>
      </div>
    </div>
  );
}
