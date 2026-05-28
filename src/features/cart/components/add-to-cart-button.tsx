import { Show, SignInButton } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { addCartItem } from '@/features/cart/actions/cart';

type AddToCartButtonProps = {
  productId: string;
  children: ReactNode;
  className: string;
};

export function AddToCartButton({
  productId,
  children,
  className,
}: AddToCartButtonProps) {
  return (
    <>
      <Show when="signed-in">
        <form action={addCartItem} className="relative z-20 inline-flex">
          <input type="hidden" name="productId" value={productId} />
          <button type="submit" className={className}>
            {children}
          </button>
        </form>
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={className}>
            {children}
          </button>
        </SignInButton>
      </Show>
    </>
  );
}
