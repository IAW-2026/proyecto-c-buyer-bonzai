import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { PurchaseHistoryView } from '@/features/purchases/components/purchase-history-view';
import { SignedOutPurchasesPage } from '@/features/purchases/components/signed-out-purchases-page';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'My purchases | Bonzai',
  description:
    'Review your Bonzai orders, shipment details, and refund options.',
};

export default async function PurchasesPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutPurchasesPage />;
  }

  return (
    <main className="bg-surface px-4 pb-24 pt-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-12 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="mb-4 font-label text-xs uppercase tracking-[0.22em] text-secondary">
              Purchase archive
            </p>
            <h1 className="font-headline text-5xl leading-[0.95] tracking-[-0.04em] text-primary sm:text-7xl lg:text-8xl">
              My purchases
            </h1>
          </div>
          <p className="max-w-3xl font-body text-sm leading-7 text-secondary sm:text-base sm:leading-8 lg:pb-2">
            A quiet record of every Bonzai order, from the pieces you selected
            to the shipment that carried them home.
          </p>
        </header>

        <Suspense>
          <PurchaseHistoryView userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}
