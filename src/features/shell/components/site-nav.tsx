import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { SearchBar } from './search-bar';

export function SiteNav() {
  return (
    <header className="relative z-30 w-full bg-surface/90 backdrop-blur-[20px]">
      <nav className="mx-auto flex min-h-14 w-full max-w-360 items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex cursor-pointer items-center gap-2"
            aria-label="Bonzai home"
          >
            <LogoMark />
            <span className="font-headline text-lg tracking-tight text-primary transition group-hover:text-primary-container sm:text-xl">
              Bonzai
            </span>
          </Link>
        </div>

        <SearchBar className="mx-auto max-w-xl" />

        <AccountControls className="flex shrink-0" />
      </nav>
    </header>
  );
}

function AccountControls({ className = '' }: { className?: string }) {
  return (
    <div className={`items-center gap-3 ${className}`}>
      <button
        type="button"
        className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Open shopping bag"
      >
        <ShoppingBagIcon className="size-5" />
      </button>

      <Show when="signed-out">
        <SignInButton>
          <button
            type="button"
            className="hidden cursor-pointer rounded-lg px-3 py-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton>
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-primary px-3 py-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Join
          </button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: 'size-9',
              userButtonTrigger:
                'cursor-pointer rounded-lg focus:shadow-[0_0_0_3px_rgba(3,39,26,0.16)]',
            },
          }}
        />
      </Show>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-on-primary shadow-[0_18px_34px_rgba(27,28,26,0.06)]">
      <svg
        aria-hidden="true"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      >
        <path d="M12 20V9" />
        <path d="M12 9c-4.2 0-6.8-1.8-8-5 4.8-.4 7.6 1.3 8 5Z" />
        <path d="M12 12c4.4 0 7-1.9 8-5-4.7-.5-7.5 1.2-8 5Z" />
      </svg>
    </span>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M6.5 8.5h11l-.75 11h-9.5l-.75-11Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </svg>
  );
}
