import { ShopCategoryFilters } from '@/features/shop/components/shop-category-filters';
import { ShopPagination } from '@/features/shop/components/shop-pagination';
import { ShopResults } from '@/features/shop/components/shop-results';
import {
  getProductCategories,
  searchProducts,
} from '@/features/shop/data/products';
import { Suspense } from 'react';

type ShopQueryPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
};

const PRODUCTS_PER_PAGE = 20;

export default async function ShopQueryPage({
  searchParams,
}: ShopQueryPageProps) {
  const params = await searchParams;
  const query = getFirstParam(params.q)?.trim() ?? '';
  const category = getFirstParam(params.category)?.trim() ?? '';
  const requestedPage = getPageParam(params.page);
  const hasFilters = Boolean(query || category);
  const productsPromise = searchProducts({ query, category });

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

          <Suspense fallback={<ShopSummarySkeleton />}>
            <ShopSummary
              productsPromise={productsPromise}
              query={query}
              category={category}
            />
          </Suspense>
        </section>

        <Suspense fallback={<ShopContentSkeleton />}>
          <ShopContent
            productsPromise={productsPromise}
            query={query}
            category={category}
            requestedPage={requestedPage}
          />
        </Suspense>
      </div>
    </main>
  );
}

async function ShopSummary({
  productsPromise,
  query,
  category,
}: {
  productsPromise: ReturnType<typeof searchProducts>;
  query: string;
  category: string;
}) {
  const products = await productsPromise;
  const hasFilters = Boolean(query || category);

  return (
    <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-secondary sm:text-base sm:leading-7">
      {hasFilters
        ? resultSummary({ count: products.length, query, category })
        : 'Explore curated plants, vessels, and care-led pieces selected for calm, architectural interiors.'}
    </p>
  );
}

function ShopSummarySkeleton() {
  return (
    <div className="mt-5 max-w-2xl space-y-2" aria-hidden="true">
      <div className="h-4 w-full bg-surface-container" />
      <div className="h-4 w-4/5 bg-surface-container" />
    </div>
  );
}

async function ShopContent({
  productsPromise,
  query,
  category,
  requestedPage,
}: {
  productsPromise: ReturnType<typeof searchProducts>;
  query: string;
  category: string;
  requestedPage: number;
}) {
  const [products, categories] = await Promise.all([
    productsPromise,
    getProductCategories(),
  ]);
  const pageCount = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const totalPages = Math.max(pageCount, 1);
  const currentPage = clampPage(requestedPage, totalPages);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );
  const shouldShowPagination = pageCount > 1;

  return (
    <>
      <ShopCategoryFilters categories={categories} selectedCategory={category} />

      <ShopResults products={paginatedProducts} />

      {shouldShowPagination ? (
        <ShopPagination
          currentPage={currentPage}
          totalPages={pageCount}
          query={query}
          category={category}
        />
      ) : null}
    </>
  );
}

function ShopContentSkeleton() {
  return (
    <div aria-label="Shop products loading" aria-busy="true">
      <div className="mb-10 flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-9 rounded-full bg-surface-container-low"
            style={{ width: `${index % 2 === 0 ? 4.75 : 6.25}rem` }}
          />
        ))}
      </div>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <article key={index} className="bg-surface-container-lowest p-4 sm:p-6 md:col-span-4">
            <div className="mb-6 aspect-4/5 animate-pulse bg-surface-container-highest" />
            <div className="mb-3 h-5 w-24 rounded-full bg-secondary-container/60" />
            <div className="h-8 w-3/4 bg-surface-container-high" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full bg-surface-container" />
              <div className="h-4 w-5/6 bg-surface-container" />
            </div>
            <div className="mt-8 h-7 w-24 bg-surface-container-high" />
          </article>
        ))}
      </section>
    </div>
  );
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPageParam(value: string | string[] | undefined) {
  const page = Number(getFirstParam(value));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
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
