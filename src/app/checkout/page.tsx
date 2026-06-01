import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCartForUser } from '@/features/cart/data/cart';
import { SignedOutCartPage } from '@/features/cart/components/signed-out-cart-page';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';
import { OrderSummary } from '@/features/checkout/components/order-summary';

export default async function CheckoutPage() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return <SignedOutCartPage />;
  }

  const cart = await getCartForUser(userId);
  const isCartEmpty = cart.items.length === 0;

  return (
    <main className="min-h-screen bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <header className="mb-10 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            Checkout privado
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            Datos de envio
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">
            Completa la informacion para preparar una entrega cuidada dentro de
            Argentina.
          </p>
        </header>

        {isCartEmpty ? (
          <section
            className="mb-8 bg-tertiary-container px-5 py-4 text-sm font-medium text-tertiary"
            role="alert"
          >
            Tu carrito esta vacio. Agrega productos antes de completar el
            pedido.
            <Link className="ml-2 underline underline-offset-4" href="/shop">
              Ir a la tienda
            </Link>
          </section>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <section
              className="bg-surface-container-lowest p-6 sm:p-8"
              aria-labelledby="shipping-form-title"
            >
              <h2 id="shipping-form-title" className="sr-only">
                Informacion de envio
              </h2>
              <CheckoutForm isCartEmpty={isCartEmpty} />
            </section>

            <OrderSummary cart={cart} />
          </div>
        )}
      </div>
    </main>
  );
}
