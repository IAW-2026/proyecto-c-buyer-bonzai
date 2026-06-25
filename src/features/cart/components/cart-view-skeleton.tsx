export function CartViewSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
      aria-label="Cart loading"
      aria-busy="true"
    >
      <section className="space-y-4" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <article
            key={index}
            className="grid gap-5 bg-surface-container-lowest p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-5"
          >
            <div className="aspect-square bg-surface-container-highest" />
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 h-3 w-24 bg-surface-container" />
                <div className="h-7 w-56 bg-surface-container-high" />
                <div className="mt-3 h-4 w-24 bg-surface-container" />
              </div>
              <div className="flex flex-wrap items-center gap-5 md:justify-end">
                <div className="h-10 w-36 bg-surface-container" />
                <div className="h-7 w-20 bg-surface-container-high" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="bg-surface-container-lowest p-6 lg:sticky lg:top-6" aria-hidden="true">
        <div className="mb-5 h-4 w-32 bg-surface-container" />
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-24 bg-surface-container" />
            <div className="h-4 w-16 bg-surface-container-high" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-20 bg-surface-container" />
            <div className="h-4 w-12 bg-surface-container-high" />
          </div>
          <div className="flex items-center justify-between gap-4 pt-6">
            <div className="h-8 w-20 bg-surface-container-high" />
            <div className="h-8 w-24 bg-surface-container-high" />
          </div>
        </div>
        <div className="mt-8 h-12 w-full bg-surface-container-high" />
      </aside>
    </div>
  );
}
