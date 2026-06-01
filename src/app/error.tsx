'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative isolate overflow-hidden bg-surface px-4 py-16 text-on-surface sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div
        className="absolute -left-32 top-20 -z-10 h-96 w-96 rounded-full bg-secondary-container/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-8 -z-10 h-112 w-md rounded-full bg-tertiary-container/80 blur-3xl"
        aria-hidden="true"
      />

      <section
        className="mx-auto grid min-h-[calc(100vh-22rem)] max-w-360 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
        aria-labelledby="error-title"
      >
        <div className="bg-surface-container-low p-5 sm:p-8 lg:translate-y-8">
          <div className="bg-surface-container-lowest p-6 sm:p-10">
            <p className="font-label text-xs uppercase tracking-[0.22em] text-secondary">
              Archive interruption
            </p>
            <h1
              id="error-title"
              className="mt-4 font-headline text-5xl leading-[0.95] tracking-tighter text-primary sm:text-7xl lg:text-8xl"
            >
              The greenhouse paused mid-bloom.
            </h1>
            <p className="mt-6 max-w-xl font-body text-base leading-8 text-secondary sm:text-lg sm:leading-9">
              Something in the living archive could not be arranged. Try again,
              or return to Bonzai while this specimen settles back into place.
            </p>

            {error.digest ? (
              <p className="mt-6 font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                Reference {error.digest}
              </p>
            ) : null}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex cursor-pointer justify-center rounded-sm bg-primary px-7 py-3 font-label text-xs font-semibold uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex cursor-pointer justify-center rounded-sm bg-surface-container px-7 py-3 font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:-translate-y-8">
          <div className="relative mx-auto aspect-4/5 max-w-xl overflow-hidden bg-surface-container-highest px-8 py-10 sm:px-12 sm:py-14">
            <span
              className="absolute -right-6 top-6 font-headline text-[10rem] leading-none tracking-[-0.08em] text-primary/8 sm:text-[14rem] lg:text-[17rem]"
              aria-hidden="true"
            >
              500
            </span>

            <div className="relative flex h-full items-center justify-center">
              <svg
                fill="none"
                aria-hidden="true"
                className="h-full max-h-120 w-full text-primary"
                viewBox="0 0 320 420"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M159 386c.8-70 2.8-139 6-207 2.8-58 10.8-104 24-145"
                />
                <path
                  fill="#526347"
                  fillOpacity=".8"
                  d="M166 178c-39-37-78-55-117-52 7 48 44 83 110 106"
                />
                <path
                  fill="#03271a"
                  fillOpacity=".9"
                  d="M172 142c47-36 85-48 116-37-12 45-50 76-113 93"
                />
                <path
                  fill="#1b3d2f"
                  fillOpacity=".88"
                  d="M161 275c-42-34-80-48-114-41 12 45 50 74 113 89"
                />
                <path
                  fill="#526347"
                  fillOpacity=".72"
                  d="M166 244c44-35 80-49 110-41-11 44-48 74-109 90"
                />
                <path
                  stroke="#faf9f4"
                  strokeLinecap="round"
                  strokeOpacity=".55"
                  strokeWidth="2"
                  d="M167 179c-28-26-61-41-99-45m105 64c31-30 62-56 93-82"
                />
                <path
                  stroke="#faf9f4"
                  strokeLinecap="round"
                  strokeOpacity=".5"
                  strokeWidth="2"
                  d="M162 319c-30-28-62-51-97-75m101 45c31-25 62-49 94-74"
                />
                <path
                  stroke="#341b00"
                  strokeLinecap="round"
                  strokeOpacity=".45"
                  strokeWidth="3"
                  d="M110 354c34 18 73 20 116 4"
                />
              </svg>
            </div>

            <div className="absolute bottom-5 left-5 right-5 bg-surface/88 p-4 backdrop-blur-[20px] sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-72">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                Recovery note
              </p>
              <p className="mt-2 font-headline text-2xl leading-none text-primary">
                A composed pause before the archive resumes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
