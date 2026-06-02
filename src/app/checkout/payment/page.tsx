import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';
import { getCartForUser } from '@/features/cart/data/cart';
import { CheckoutFlowSkeleton } from '@/features/checkout/components/checkout-flow-skeleton';
import { OrderSummary } from '@/features/checkout/components/order-summary';
import { PaymentActions } from '@/features/checkout/components/payment-actions';
import { Suspense } from 'react';

export default async function CheckoutPaymentPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Payment gateway
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Payment confirmation
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">
            This screen represents the real gateway. Choose the result to
            simulate the payment provider's response.
          </p>
        </header>

        <Suspense fallback={<CheckoutFlowSkeleton variant="payment" />}>
          <CheckoutPaymentContent userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutPaymentContent({ userId }: { userId: string }) {
  const cart = await getCartForUser(userId);

  if (cart.items.length === 0) {
    return (
      <section className="bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary" role="alert">
        Your cart is empty. There is no payment to process.
        <Link className="ml-2 underline underline-offset-4" href="/shop">
          Go to the shop
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section className="bg-surface-container-lowest p-6 sm:p-8" aria-labelledby="payment-simulation-title">
        <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Test environment
        </p>
        <h2
          id="payment-simulation-title"
          className="mt-4 font-headline text-4xl leading-none tracking-[-0.04em] text-primary"
        >
          Simulate the gateway response.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-7 text-secondary">
          In a real integration, Bonzai would redirect here to the payment provider and
          return with the final transaction status.
        </p>
        <PaymentActions />
        <Link
          href="/checkout/review"
          className="mt-6 inline-flex text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to order review
        </Link>
      </section>

      <OrderSummary cart={cart} />
    </div>
  );
}
