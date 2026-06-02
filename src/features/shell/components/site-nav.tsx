import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  getProductCategories,
  getProductSearchItems,
} from '@/features/shop/data/products';
import { CartNavLink } from './cart-nav-link';
import { CategoryMenu } from './category-menu';
import { SearchBar } from './search-bar';
import PurchasesNavLink from './purchases-nav-link';

export function SiteNav() {
  return (
    <header className="relative z-30 w-full bg-surface/90 backdrop-blur-[20px]">
      <nav className="mx-auto flex min-h-14 w-full max-w-360 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex cursor-pointer items-center gap-2"
            aria-label="Bonzai home"
          >
            <span className="font-headline text-lg tracking-tight mt-1 text-primary transition group-hover:text-primary-container sm:text-xl">
              Bonzai
            </span>
          </Link>
        </div>

        <Suspense fallback={<SearchBarFallback className="mx-auto max-w-xl" />}>
          <SearchBarSlot />
        </Suspense>

        <AccountControls className="flex shrink-0" />
      </nav>

      <nav
        className="mx-auto flex w-full max-w-360 flex-wrap justify-center items-center gap-2 px-4 pb-3 sm:px-6 lg:px-8"
        aria-label="Shop sections"
      >
        <Suspense fallback={<CategoryMenuFallback />}>
          <CategoryMenuSlot />
        </Suspense>

        <Link
          href="/shop?q=Accessories"
          className="flex h-9 shrink-0 items-center rounded-full px-4 font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition hover:bg-surface-container-low hover:text-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Accessories
        </Link>

        <a
          href="https://proyecto-c-seller-bonzai.vercel.app/"
          className="flex h-9 shrink-0 items-center rounded-full px-4 font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition hover:bg-surface-container-low hover:text-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sell
        </a>

        <Link
          href="/shop?q=care"
          className="flex h-9 shrink-0 items-center rounded-full px-4 font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition hover:bg-surface-container-low hover:text-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Care
        </Link>
      </nav>
    </header>
  );
}

async function SearchBarSlot() {
  const searchItems = await getProductSearchItems();

  return <SearchBar className="mx-auto max-w-xl" items={searchItems} />;
}

async function CategoryMenuSlot() {
  const categories = await getProductCategories();

  return <CategoryMenu categories={categories} />;
}

function SearchBarFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`min-w-0 flex-1 ${className}`} aria-hidden="true">
      <div className="h-10 rounded-lg bg-surface-container" />
    </div>
  );
}

function CategoryMenuFallback() {
  return (
    <div
      className="h-9 w-32 shrink-0 rounded-full bg-surface-container-low"
      aria-hidden="true"
    />
  );
}

function AccountControls({ className = '' }: { className?: string }) {
  return (
    <div className={`items-center gap-3 ${className}`}>
      <PurchasesNavLink />

      <CartNavLink />

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className="hidden cursor-pointer rounded-lg px-3 py-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
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
