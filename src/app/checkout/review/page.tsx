import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCartForUser } from '@/features/cart/data/cart';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';
import { CheckoutReview } from '@/features/checkout/components/checkout-review';
import { CheckoutFlowSkeleton } from '@/features/checkout/components/checkout-flow-skeleton';
import { Suspense } from 'react';

export default async function CheckoutReviewPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Final review
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Order details
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">
            Confirm the address and summary before proceeding to the simulated payment.
          </p>
        </header>

        <Suspense fallback={<CheckoutFlowSkeleton variant="review" />}>
          <CheckoutReviewContent userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutReviewContent({ userId }: { userId: string }) {
  const cart = await getCartForUser(userId);

  if (cart.items.length === 0) {
    return (
      <section className="bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary" role="alert">
        Your cart is empty. There is no order to review.
        <Link className="ml-2 underline underline-offset-4" href="/shop">
          Go to the shop
        </Link>
      </section>
    );
  }

  return <CheckoutReview cart={cart} />;
}
