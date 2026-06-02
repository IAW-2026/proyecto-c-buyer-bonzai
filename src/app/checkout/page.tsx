import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCartForUser } from '@/features/cart/data/cart';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';
import { OrderSummary } from '@/features/checkout/components/order-summary';
import { CheckoutFlowSkeleton } from '@/features/checkout/components/checkout-flow-skeleton';
import { Suspense } from 'react';

export default async function CheckoutPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Private checkout
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Shipping details
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">
            Complete the information to prepare a careful delivery within
            Argentina.
          </p>
        </header>

        <Suspense fallback={<CheckoutFlowSkeleton />}>
          <CheckoutContent userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutContent({ userId }: { userId: string }) {
  const cart = await getCartForUser(userId);
  const isCartEmpty = cart.items.length === 0;

  return (
    <>
      {isCartEmpty ? (
        <section
          className="mb-8 bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary"
          role="alert"
        >
          Your cart is empty. Add products before completing your order.
          <Link className="ml-2 underline underline-offset-4" href="/shop">
            Go to the shop
          </Link>
        </section>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <section
            className="bg-surface-container-lowest p-6 sm:p-8"
            aria-labelledby="shipping-form-title"
          >
            <h2 id="shipping-form-title" className="sr-only">
              Shipping information
            </h2>
            <CheckoutForm isCartEmpty={isCartEmpty} />
          </section>

          <OrderSummary cart={cart} />
        </div>
      )}
    </>
  );
}
