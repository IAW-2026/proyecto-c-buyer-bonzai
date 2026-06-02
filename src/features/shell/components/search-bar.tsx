'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { ProductSearchItem } from '@/features/shop/data/products';

type SearchBarProps = {
  className?: string;
  items: ProductSearchItem[];
};

export function SearchBar({ className = '', items }: SearchBarProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  return (
    <SearchBarInner
      key={initialQuery}
      className={className}
      initialQuery={initialQuery}
      items={items}
    />
  );
}

function SearchBarInner({
  className,
  initialQuery,
  items,
}: SearchBarProps & { initialQuery: string }) {
  const router = useRouter();
  const listboxId = useId();
  const optionBaseId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items.slice(0, 5);
    }

    return items
      .filter((item) => {
        const text = `${item.label} ${item.detail ?? ''}`.toLowerCase();
        return text.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [items, query]);

  const activeSuggestion =
    activeIndex === null ? null : (suggestions[activeIndex] ?? null);

  function pushSearch(nextQuery: string) {
    const trimmedQuery = nextQuery.trim();
    const params = new URLSearchParams();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    const href = params.toString()
      ? `/shop?${params.toString()}`
      : '/shop';

    setIsOpen(false);
    router.push(href);
  }

  function pushSuggestion(item: ProductSearchItem) {
    const params = new URLSearchParams();

    if (item.type === 'category') {
      params.set('category', item.label);
    } else {
      params.set('q', item.label);
    }

    setQuery(item.label);
    setIsOpen(false);
    router.push(`/shop?${params.toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushSearch(query);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      setIsOpen(true);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? null
          : current === null
            ? 0
            : (current + 1) % suggestions.length,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? null
          : current === null
            ? suggestions.length - 1
            : (current - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }

    if (event.key === 'Enter' && isOpen && activeSuggestion) {
      event.preventDefault();
      pushSuggestion(activeSuggestion);
    }
  }

  return (
    <form
      role="search"
      className={`relative min-w-0 flex-1 ${className}`}
      onSubmit={handleSubmit}
    >
      <label htmlFor="site-search" className="sr-only">
        Search plants and accessories
      </label>
      <div className="flex h-10 items-center gap-3 rounded-lg bg-surface-container px-3 text-on-surface-variant transition-colors focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/15">
        <SearchIcon className="size-4 shrink-0 text-secondary" />
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search plants, vessels, care notes"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && activeIndex !== null && activeSuggestion
              ? `${optionBaseId}-${activeIndex}`
              : undefined
          }
          className="w-full bg-transparent font-body text-sm text-primary outline-none placeholder:text-on-surface-variant/65"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl bg-surface-container-lowest p-2 shadow-[0_24px_48px_rgba(27,28,26,0.06)]">
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-80 overflow-y-auto"
          >
            {suggestions.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                id={`${optionBaseId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  index === activeIndex
                    ? 'bg-surface-container-low text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pushSuggestion(item)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-body text-sm">
                    {item.label}
                  </span>
                  {item.detail ? (
                    <span className="block font-label text-[10px] uppercase tracking-[0.16em] text-secondary">
                      {item.detail}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 rounded-full bg-secondary-container px-2 py-0.5 font-label text-[10px] uppercase tracking-[0.14em] text-on-secondary-container">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="6.5" />
    </svg>
  );
}
