'use client';

import { Show, SignInButton } from '@clerk/nextjs';
import { useActionState, useEffect, useState } from 'react';
import {
  addCartItemWithState,
  type AddCartItemState,
} from '@/features/cart/actions/cart';
import { Calligraph } from 'calligraph';

const initialAddCartItemState: AddCartItemState = {
  status: 'idle',
  submissionId: 0,
};

type AddToCartButtonProps = {
  productId: string;
  className: string;
};

export function AddToCartButton({
  productId,
  className,
}: AddToCartButtonProps) {
  const [state, formAction, isPending] = useActionState(
    addCartItemWithState,
    initialAddCartItemState,
  );
  const [successVisible, setSuccessVisible] = useState(false);
  const showSuccess = successVisible && !isPending;

  useEffect(() => {
    if (state.status !== 'success') {
      return;
    }

    const showSuccessTimeoutId = window.setTimeout(() => {
      setSuccessVisible(true);
    }, 0);

    const hideSuccessTimeoutId = window.setTimeout(() => {
      setSuccessVisible(false);
    }, 1600);

    return () => {
      window.clearTimeout(showSuccessTimeoutId);
      window.clearTimeout(hideSuccessTimeoutId);
    };
  }, [state.status, state.submissionId]);

  return (
    <>
      <Show when="signed-in">
        <form action={formAction} className="relative z-20 inline-flex">
          <input type="hidden" name="productId" value={productId} />
          <button
            type="submit"
            disabled={isPending}
            className={`${className} disabled:cursor-wait disabled:opacity-70`}
          >
            <span className="inline-flex items-center gap-2">
              <Calligraph>
                {isPending
                  ? 'Adding...'
                  : showSuccess
                    ? 'Added to Bag'
                    : 'Add to Bag'}
              </Calligraph>
              {showSuccess ? <CheckIcon className="size-3.5" /> : null}
            </span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {showSuccess ? 'Product added to bag' : ''}
          </span>
        </form>
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={className}>
            Add to Bag
          </button>
        </SignInButton>
      </Show>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}
