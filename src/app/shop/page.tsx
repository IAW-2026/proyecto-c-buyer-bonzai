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
  const categoryId = getFirstParam(params.category)?.trim() ?? '';
  const requestedPage = getPageParam(params.page);
  const hasFilters = Boolean(query || categoryId);
  const productsPromise = searchProducts({
    query,
    categoryId,
    page: requestedPage,
    limit: PRODUCTS_PER_PAGE,
  });
  const categoriesPromise = getProductCategories();

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
              categoriesPromise={categoriesPromise}
              query={query}
              categoryId={categoryId}
            />
          </Suspense>
        </section>

        <Suspense fallback={<ShopContentSkeleton />}>
          <ShopContent
            productsPromise={productsPromise}
            categoriesPromise={categoriesPromise}
            query={query}
            categoryId={categoryId}
            requestedPage={requestedPage}
          />
        </Suspense>
      </div>
    </main>
  );
}

async function ShopSummary({
  productsPromise,
  categoriesPromise,
  query,
  categoryId,
}: {
  productsPromise: ReturnType<typeof searchProducts>;
  categoriesPromise: ReturnType<typeof getProductCategories>;
  query: string;
  categoryId: string;
}) {
  const [productsResult, categories] = await Promise.all([
    productsPromise,
    categoriesPromise,
  ]);
  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );
  const categoryName = selectedCategory?.name ?? categoryId;
  const hasFilters = Boolean(query || categoryId);

  return (
    <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-secondary sm:text-base sm:leading-7">
      {hasFilters
        ? resultSummary({ count: productsResult.total, query, categoryName })
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
  categoriesPromise,
  query,
  categoryId,
  requestedPage,
}: {
  productsPromise: ReturnType<typeof searchProducts>;
  categoriesPromise: ReturnType<typeof getProductCategories>;
  query: string;
  categoryId: string;
  requestedPage: number;
}) {
  const [productsResult, categories] = await Promise.all([
    productsPromise,
    categoriesPromise,
  ]);
  const pageCount = Math.ceil(productsResult.total / productsResult.limit);
  const totalPages = Math.max(pageCount, 1);
  const currentPage = clampPage(productsResult.page || requestedPage, totalPages);
  const shouldShowPagination = pageCount > 1;

  return (
    <>
      <ShopCategoryFilters categories={categories} selectedCategoryId={categoryId} />

      <ShopResults products={productsResult.products} />

      {shouldShowPagination ? (
        <ShopPagination
          currentPage={currentPage}
          totalPages={pageCount}
          query={query}
          category={categoryId}
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
  categoryName,
}: {
  count: number;
  query: string;
  categoryName: string;
}) {
  const resultLabel = count === 1 ? 'piece' : 'pieces';

  if (query && categoryName) {
    return `${count} ${resultLabel} found for "${query}" in ${categoryName}.`;
  }

  if (query) {
    return `${count} ${resultLabel} found for "${query}".`;
  }

  return `${count} ${resultLabel} found in ${categoryName}.`;
}
