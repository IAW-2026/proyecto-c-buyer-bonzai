import { SignInButton } from '@clerk/nextjs';

export function SignedOutCartPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl bg-surface-container-lowest p-8 text-center sm:p-12">
        <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Curated bag
        </p>
        <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
          Sign in to use your cart.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-secondary md:text-base">
          Sign in to view your saved products, adjust quantities, and continue
          to checkout.
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="mt-8 inline-flex cursor-pointer rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in
          </button>
        </SignInButton>
      </section>
    </main>
  );
}
