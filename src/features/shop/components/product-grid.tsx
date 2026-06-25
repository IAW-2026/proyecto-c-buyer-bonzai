import { ProductCard } from '@/features/shop/components/product-card';
import { getProducts } from '@/features/shop/data/products';

export async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <section className="bg-surface-container-low px-6 py-16 text-center">
        <h2 className="font-headline text-3xl text-primary">
          No plants available
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-secondary">
          The archive is being refreshed. Please check back soon.
        </p>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12"
      aria-label="Curated products"
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index === 0}
          className="md:col-span-4"
        />
      ))}
    </section>
  );
}

export function ProductGridSkeleton() {
  return (
    <section
      className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12"
      aria-label="Curated products loading"
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <article
          key={index}
          className="flex h-full flex-col bg-surface-container-lowest p-4 sm:p-6 md:col-span-4"
          aria-hidden="true"
        >
          <div className="mb-6 aspect-4/5 animate-pulse bg-surface-container-highest" />
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-secondary-container/70" />
            <div className="h-5 w-16 rounded-full bg-secondary-container/50" />
          </div>
          <div className="h-8 w-3/4 bg-surface-container-high" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-surface-container" />
            <div className="h-4 w-5/6 bg-surface-container" />
          </div>
          <div className="mt-8 h-7 w-24 bg-surface-container-high" />
        </article>
      ))}
    </section>
  );
}
