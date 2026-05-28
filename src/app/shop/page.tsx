import { ShopCategoryFilters } from '@/features/shop/components/shop-category-filters';
import { ShopPagination } from '@/features/shop/components/shop-pagination';
import { ShopResults } from '@/features/shop/components/shop-results';
import {
  getProductCategories,
  searchProducts,
} from '@/features/shop/data/products';

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
  const [products, categories] = await Promise.all([
    searchProducts({ query, category }),
    getProductCategories(),
  ]);
  const hasFilters = Boolean(query || category);
  const pageCount = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const totalPages = Math.max(pageCount, 1);
  const currentPage = clampPage(requestedPage, totalPages);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );
  const shouldShowPagination = pageCount > 1;

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

        <ShopCategoryFilters
          categories={categories}
          selectedCategory={category}
        />

        <ShopResults products={paginatedProducts} />

        {shouldShowPagination ? (
          <ShopPagination
            currentPage={currentPage}
            totalPages={pageCount}
            query={query}
            category={category}
          />
        ) : null}
      </div>
    </main>
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
