import { Product } from '@/features/shop/types';
import { ProductCard } from '@/features/shop/components/product-card';
import { getProducts } from '@/features/shop/data/products';

export async function ProductGrid() {
  const [featuredProduct, ...secondaryProducts] = await getProducts();

  if (!featuredProduct) {
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
      <ProductCard
        product={featuredProduct}
        variant="featured"
        priority
        className="md:col-span-8"
      />

      {secondaryProducts.map((product: Product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="md:col-span-4"
        />
      ))}
    </section>
  );
}
