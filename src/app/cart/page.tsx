import Link from 'next/link';

export default function CartPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl bg-surface-container-lowest p-8 text-center sm:p-12">
        <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
          Curated bag
        </p>
        <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
          Your cart is waiting for plants.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-secondary md:text-base">
          Add a plant or vessel from the archive and it will appear here when cart behavior is connected.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex cursor-pointer rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Return to shop
        </Link>
      </section>
    </main>
  );
}
