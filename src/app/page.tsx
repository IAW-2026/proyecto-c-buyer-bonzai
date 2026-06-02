import Link from 'next/link';
import { Suspense } from 'react';
import { PaymentResultDialog } from '@/features/checkout/components/payment-result-dialog';
import { ProductGrid } from '@/features/shop/components/product-grid';

export default async function Home() {
  return (
    <main className="bg-surface px-4 pb-24 pt-10 text-on-surface sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <PaymentResultDialog />
      </Suspense>

      <div className="mx-auto max-w-360">
        <ProductGrid />

        <div className="mt-24 text-center">
          <Link
            href="/shop"
            className="group mx-auto flex cursor-pointer flex-col items-center"
          >
            <span className="mb-4 font-label text-xs uppercase tracking-[0.2em] text-secondary">
              Discover More
            </span>
            <span className="h-16 w-px bg-outline-variant transition-all duration-500 group-hover:h-24" />
          </Link>
        </div>
      </div>
    </main>
  );
}
