export function CheckoutFlowSkeleton({
  variant = 'form',
}: {
  variant?: 'form' | 'payment' | 'review';
}) {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
      aria-label="Checkout loading"
      aria-busy="true"
    >
      <section className="bg-surface-container-lowest p-6 sm:p-8" aria-hidden="true">
        <div className="h-4 w-36 bg-surface-container" />
        <div className="mt-4 h-10 w-72 max-w-full bg-surface-container-high" />
        <div className="mt-5 h-4 w-full max-w-xl bg-surface-container" />
        <div className="mt-2 h-4 w-4/5 max-w-xl bg-surface-container" />

        {variant === 'form' ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index}>
                <div className="h-3 w-24 bg-surface-container" />
                <div className="mt-2 h-12 bg-surface-container-low" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: variant === 'review' ? 8 : 4 }, (_, index) => (
              <div key={index} className="bg-surface-container-low px-4 py-4">
                <div className="h-3 w-24 bg-surface-container" />
                <div className="mt-3 h-5 w-40 bg-surface-container-high" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 h-12 w-44 bg-surface-container-high" />
      </section>

      <aside className="bg-surface-container-lowest p-6 lg:sticky lg:top-6" aria-hidden="true">
        <div className="mb-5 h-4 w-32 bg-surface-container" />
        <div className="space-y-5">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-start justify-between gap-4">
              <div>
                <div className="h-6 w-36 bg-surface-container-high" />
                <div className="mt-2 h-4 w-20 bg-surface-container" />
              </div>
              <div className="h-5 w-16 bg-surface-container-high" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-4 border-t border-outline-variant pt-5">
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-24 bg-surface-container" />
            <div className="h-4 w-16 bg-surface-container-high" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-20 bg-surface-container-high" />
            <div className="h-8 w-24 bg-surface-container-high" />
          </div>
        </div>
      </aside>
    </div>
  );
}
