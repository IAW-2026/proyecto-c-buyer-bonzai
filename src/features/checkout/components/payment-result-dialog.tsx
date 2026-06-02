'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type PaymentResult = 'success' | 'error';

const paymentCopy: Record<PaymentResult, { title: string; description: string; action: string }> = {
  success: {
    title: 'Order confirmed.',
    description:
      'The test transaction completed successfully. Your Bonzai is ready for preparation.',
    action: 'Close',
  },
  error: {
    title: 'We couldn\'t process the payment.',
    description:
      'The simulated gateway returned an error. You can go back to checkout to try again.',
    action: 'Got it',
  },
};

export function PaymentResultDialog() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get('payment');
  const paymentResult = paymentParam === 'success' || paymentParam === 'error' ? paymentParam : null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !paymentResult || dialog.open) {
      return;
    }

    dialog.showModal();
  }, [paymentResult]);

  function closeDialog() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('payment');

    const nextQuery = params.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    dialogRef.current?.close();
    router.replace(nextHref, { scroll: false });
  }

  if (!paymentResult) {
    return null;
  }

  const copy = paymentCopy[paymentResult];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="payment-result-title"
      aria-describedby="payment-result-description"
      onCancel={closeDialog}
      className="m-auto w-[calc(100%-2rem)] max-w-lg bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_rgb(27_28_25/0.16)] backdrop:bg-on-surface/30 backdrop:backdrop-blur-sm"
    >
      <div className="p-8 sm:p-10">
        <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Simulated payment
        </p>
        <h2
          id="payment-result-title"
          className="mt-4 font-headline text-5xl leading-none tracking-[-0.04em] text-primary"
        >
          {copy.title}
        </h2>
        <p id="payment-result-description" className="mt-5 text-sm leading-7 text-secondary">
          {copy.description}
        </p>
        <button
          type="button"
          onClick={closeDialog}
          className="mt-8 inline-flex rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {copy.action}
        </button>
      </div>
    </dialog>
  );
}
