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
