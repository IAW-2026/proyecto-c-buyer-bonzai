import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCartForUser } from '@/features/cart/data/cart';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';
import { CheckoutReview } from '@/features/checkout/components/checkout-review';
import { CheckoutFlowSkeleton } from '@/features/checkout/components/checkout-flow-skeleton';
import { getCheckoutShippingSelection } from '@/features/checkout/data/shipping';
import { Suspense } from 'react';

type CheckoutReviewPageProps = {
  searchParams: Promise<{ addressId?: string | string[] }>;
};

export default async function CheckoutReviewPage({
  searchParams,
}: CheckoutReviewPageProps) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  const { addressId } = await searchParams;

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Revision final
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Detalles del pedido
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">
            Confirma la direccion y el resumen antes de crear tu pedido pendiente.
          </p>
        </header>

        <Suspense fallback={<CheckoutFlowSkeleton variant="review" />}>
          <CheckoutReviewContent
            userId={userId}
            addressId={readAddressId(addressId)}
          />
        </Suspense>
      </div>
    </main>
  );
}

async function CheckoutReviewContent({
  userId,
  addressId,
}: {
  userId: string;
  addressId: string | null;
}) {
  const [cart, shipping] = await Promise.all([
    getCartForUser(userId),
    getCheckoutShippingSelection(userId, addressId),
  ]);

  if (cart.items.length === 0) {
    return (
      <section className="bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary" role="alert">
        Tu carrito esta vacio. No hay un pedido para revisar.
        <Link className="ml-2 underline underline-offset-4" href="/shop">
          Ir a la tienda
        </Link>
      </section>
    );
  }

  if (!shipping) {
    return <MissingShippingSelection />;
  }

  return <CheckoutReview cart={cart} shipping={shipping} />;
}

function MissingShippingSelection() {
  return (
    <section className="bg-surface-container-lowest p-8 sm:p-10" role="status">
      <p className="font-label text-xs uppercase tracking-[0.18em] text-secondary">
        Falta la direccion
      </p>
      <h2 className="mt-4 font-headline text-4xl leading-none tracking-[-0.04em] text-primary">
        Necesitamos una direccion guardada.
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-secondary">
        Volve al checkout y elegi una direccion de envio o crea una nueva antes
        de revisar el pedido.
      </p>
      <Link
        href="/checkout"
        className="mt-8 inline-flex rounded-sm bg-[linear-gradient(135deg,#03271a,#1b3d2f)] px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:opacity-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Elegir direccion
      </Link>
    </section>
  );
}

function readAddressId(addressId: string | string[] | undefined) {
  if (Array.isArray(addressId)) {
    return addressId[0] ?? null;
  }

  return addressId ?? null;
}
