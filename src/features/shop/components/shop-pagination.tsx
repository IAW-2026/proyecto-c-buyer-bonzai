import Link from 'next/link';

type ShopPaginationProps = {
  currentPage: number;
  totalPages: number;
  query: string;
  category: string;
};

export function ShopPagination({
  currentPage,
  totalPages,
  query,
  category,
}: ShopPaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Product pagination"
      className="mt-16 border-t border-outline-variant pt-8"
    >
      <div className="flex flex-col items-center justify-between gap-6 bg-surface-container-low px-5 py-5 sm:flex-row sm:px-6">
        <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          Page {formatPageNumber(currentPage)} of {formatPageNumber(totalPages)}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <PaginationControl
            label="Previous"
            page={currentPage - 1}
            isDisabled={currentPage === 1}
            query={query}
            category={category}
          />

          <div className="flex items-center gap-2" aria-label="Pages">
            {pageNumbers.map((pageNumber) =>
              pageNumber === currentPage ? (
                <span
                  key={pageNumber}
                  aria-current="page"
                  className="grid size-10 place-items-center rounded-full bg-primary font-label text-xs font-semibold text-on-primary"
                >
                  {formatPageNumber(pageNumber)}
                </span>
              ) : (
                <Link
                  key={pageNumber}
                  href={createShopPageHref({ page: pageNumber, query, category })}
                  aria-label={`Go to page ${pageNumber}`}
                  className="grid size-10 place-items-center rounded-full bg-surface-container-lowest font-label text-xs font-semibold text-secondary transition hover:text-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {formatPageNumber(pageNumber)}
                </Link>
              ),
            )}
          </div>

          <PaginationControl
            label="Next"
            page={currentPage + 1}
            isDisabled={currentPage === totalPages}
            query={query}
            category={category}
          />
        </div>
      </div>
    </nav>
  );
}

function PaginationControl({
  label,
  page,
  isDisabled,
  query,
  category,
}: {
  label: string;
  page: number;
  isDisabled: boolean;
  query: string;
  category: string;
}) {
  const className =
    'rounded-full px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary';

  if (isDisabled) {
    return (
      <span
        aria-disabled="true"
        className={`${className} bg-surface-container text-outline`}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={createShopPageHref({ page, query, category })}
      className={`${className} bg-surface-container-lowest text-secondary hover:text-primary`}
    >
      {label}
    </Link>
  );
}

function createShopPageHref({
  page,
  query,
  category,
}: {
  page: number;
  query: string;
  category: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  if (category) {
    params.set('category', category);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();

  return queryString ? `/shop?${queryString}` : '/shop';
}

function formatPageNumber(page: number) {
  return String(page).padStart(2, '0');
}
