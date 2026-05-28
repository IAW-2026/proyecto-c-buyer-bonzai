import { auth } from '@clerk/nextjs/server';
import { CartView } from '@/features/cart/components/cart-view';
import { getCartForUser } from '@/features/cart/data/cart';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';

export default async function CartPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  const cart = await getCartForUser(userId);

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Curated bag
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Your cart
          </h1>
        </header>
        <CartView cart={cart} />
      </div>
    </main>
  );
}
