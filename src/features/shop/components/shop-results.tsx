import { ProductCard } from '@/features/shop/components/product-card';
import type { Product } from '@/features/shop/types';

type ShopResultsProps = {
  products: Product[];
};

export function ShopResults({ products }: ShopResultsProps) {
  if (products.length === 0) {
    return (
      <section className="bg-surface-container-low px-6 py-16 text-center">
        <h2 className="font-headline text-3xl text-primary">No matches found</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-secondary">
          Try a broader plant name or category to keep exploring.
        </p>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12"
      aria-label="Search results"
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
