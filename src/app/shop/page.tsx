import Link from 'next/link';
import { ProductCard } from '@/features/shop/components/product-card';
import {
  getProductCategories,
  searchProducts,
} from '@/features/shop/data/products';

type ShopQueryPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

export default async function ShopQueryPage({
  searchParams,
}: ShopQueryPageProps) {
  const params = await searchParams;
  const query = getFirstParam(params.q)?.trim() ?? '';
  const category = getFirstParam(params.category)?.trim() ?? '';
  const [products, categories] = await Promise.all([
    searchProducts({ query, category }),
    getProductCategories(),
  ]);
  const hasFilters = Boolean(query || category);

  return (
    <main className="bg-surface px-4 pb-24 pt-12 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360">
        <section className="mb-12 max-w-3xl">
          <p className="mb-3 font-label text-xs uppercase tracking-[0.22em] text-secondary">
            Shop discovery
          </p>
          <h1 className="font-headline text-4xl leading-tight text-primary sm:text-6xl">
            {hasFilters ? 'Search the living archive' : 'Browse the living archive'}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-secondary sm:text-base sm:leading-7">
            {hasFilters
              ? resultSummary({ count: products.length, query, category })
              : 'Explore curated plants, vessels, and care-led pieces selected for calm, architectural interiors.'}
          </p>
        </section>

        <div className="mb-10 flex flex-wrap gap-2" aria-label="Category filters">
          <Link
            href="/shop"
            className={`rounded-full px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ${
              !category
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-secondary hover:text-primary'
            }`}
          >
            All
          </Link>
          {categories.map((currentCategory) => (
            <Link
              key={currentCategory}
              href={`/shop?category=${encodeURIComponent(currentCategory)}`}
              className={`rounded-full px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ${
                category === currentCategory
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-secondary hover:text-primary'
              }`}
            >
              {currentCategory}
            </Link>
          ))}
        </div>

        {products.length > 0 ? (
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
        ) : (
          <section className="bg-surface-container-low px-6 py-16 text-center">
            <h2 className="font-headline text-3xl text-primary">
              No matches found
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-secondary">
              Try a broader plant name, category, or care note to keep exploring.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resultSummary({
  count,
  query,
  category,
}: {
  count: number;
  query: string;
  category: string;
}) {
  const resultLabel = count === 1 ? 'piece' : 'pieces';

  if (query && category) {
    return `${count} ${resultLabel} found for "${query}" in ${category}.`;
  }

  if (query) {
    return `${count} ${resultLabel} found for "${query}".`;
  }

  return `${count} ${resultLabel} found in ${category}.`;
}
