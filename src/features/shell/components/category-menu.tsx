'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

type CategoryMenuProps = {
  categories: string[];
};

export function CategoryMenu({ categories }: CategoryMenuProps) {
  const pathname = usePathname();

  return <CategoryMenuContent key={pathname} categories={categories} />;
}

function CategoryMenuContent({ categories }: CategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-surface-container-low px-4 font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-surface-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setIsOpen((current) => !current)}
      >
        Categories
        <ChevronDownIcon
          className={`size-3 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute left-0 top-11 z-40 min-w-56 rounded-2xl bg-surface-container-lowest p-2 shadow-[0_24px_48px_rgba(27,28,26,0.06)]"
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="block rounded-xl px-3 py-2 font-body text-sm text-primary transition hover:bg-surface-container-low focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setIsOpen(false)}
            >
              {category}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
