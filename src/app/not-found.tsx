import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found | Bonzai',
  description: 'The requested Bonzai page could not be found.',
};

export default function NotFound() {
  return (
    <main className="relative isolate overflow-hidden bg-surface px-4 py-16 text-on-surface sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div
        className="absolute -left-32 top-16 -z-10 h-96 w-96 rounded-full bg-secondary-container/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-8 -z-10 h-112 w-md rounded-full bg-tertiary-container/70 blur-3xl"
        aria-hidden="true"
      />

      <section className="mx-auto grid min-h-[calc(100vh-22rem)] max-w-360 items-center gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-16">
        <div className="order-2 bg-surface-container-low p-5 sm:p-8 lg:order-1 lg:translate-y-10">
          <div className="bg-surface-container-lowest p-6 sm:p-10">
            <p className="font-label text-xs uppercase tracking-[0.22em] text-secondary">
              Archive note 404
            </p>
            <h1 className="mt-4 font-headline text-5xl leading-[0.95] tracking-tighter text-primary sm:text-7xl lg:text-8xl">
              This leaf has fallen out of the catalog.
            </h1>
            <p className="mt-6 max-w-xl font-body text-base leading-8 text-secondary sm:text-lg sm:leading-9">
              The page you were looking for is no longer rooted here. Return to
              the living archive and keep browsing curated plants, vessels, and
              care-led pieces.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex cursor-pointer justify-center rounded-sm bg-primary px-7 py-3 font-label text-xs font-semibold uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Browse the archive
              </Link>
              <Link
                href="/"
                className="inline-flex cursor-pointer justify-center rounded-sm bg-surface-container px-7 py-3 font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-4/5 max-w-xl overflow-hidden bg-surface-container-highest px-8 py-10 sm:px-12 sm:py-14">
            <span
              className="absolute -left-4 top-6 font-headline text-[10rem] leading-none tracking-[-0.08em] text-primary/8 sm:text-[14rem] lg:text-[17rem]"
              aria-hidden="true"
            >
              404
            </span>

            <div className="relative flex h-full items-end justify-center">
              <svg fill="none" aria-hidden="true" className="h-full max-h-120 w-full text-primary" viewBox="0 0 320 420"><path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M158 390c1.7-68.3 3.8-148.5 8-224 3.4-60.9 12.4-104 26-136"/><path fill="#526347" fillOpacity=".82" d="M166 187c-38-36-75-53-111-50 5 46 40 79 103 101"/><path fill="#03271a" fillOpacity=".9" d="M170 154c46-35 82-48 112-39-10 45-47 76-108 94"/><path fill="#1b3d2f" fillOpacity=".9" d="M162 272c-40-34-76-48-108-41 11 44 48 73 108 89"/><path fill="#526347" fillOpacity=".76" d="M164 244c43-36 78-50 108-43-10 45-47 75-107 91"/><path stroke="#faf9f4" strokeLinecap="round" strokeOpacity=".55" strokeWidth="2" d="M167 188c-25-25-56-39-94-43m101 59c31-30 60-53 90-78"/><path stroke="#faf9f4" strokeLinecap="round" strokeOpacity=".5" strokeWidth="2" d="M162 318c-28-27-59-49-93-74m97 45c30-24 60-47 91-75"/></svg>
            </div>

            <div className="absolute bottom-5 left-5 right-5 bg-surface/88 p-4 backdrop-blur-[20px] sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-64">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                Specimen missing
              </p>
              <p className="mt-2 font-headline text-2xl leading-none text-primary">
                A quiet detour through the greenhouse.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
