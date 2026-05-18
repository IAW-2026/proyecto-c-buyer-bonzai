export default function Home() {
  return (
    <main className="flex flex-1 bg-stone-50 text-emerald-950">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-950/15 bg-white px-3 py-1 text-sm font-medium text-emerald-900 shadow-sm">
            Curated buying, without the noise
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Grow better purchase decisions.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-950/70">
            Buyer Bonzai helps shoppers compare options, save carts, and return to decisions with a calmer, cleaner workflow.
          </p>
        </div>

        <div className="rounded-4xl border border-emerald-950/10 bg-white p-6 shadow-2xl shadow-emerald-950/10">
          <div className="rounded-3xl bg-linear-to-br from-emerald-950 via-emerald-900 to-lime-900 p-8 text-stone-50">
            <p className="text-sm uppercase tracking-[0.35em] text-lime-100/70">Your account</p>
            <h2 className="mt-20 text-3xl font-semibold tracking-tight">Sign in or create your first test user from the nav.</h2>
            <p className="mt-4 text-stone-200">
              Once signed in, the profile control appears in the top-right corner so you can manage the session immediately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
