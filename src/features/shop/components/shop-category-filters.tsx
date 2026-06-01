import Link from 'next/link';
import type { ReactNode } from 'react';

type ShopCategoryFiltersProps = {
  categories: string[];
  selectedCategory: string;
};

export function ShopCategoryFilters({
  categories,
  selectedCategory,
}: ShopCategoryFiltersProps) {
  return (
    <div className="mb-10 flex flex-wrap gap-2" aria-label="Category filters">
      <CategoryFilterLink href="/shop" isActive={!selectedCategory}>
        All
      </CategoryFilterLink>

      {categories.map((category) => (
        <CategoryFilterLink
          key={category}
          href={`/shop?category=${encodeURIComponent(category)}`}
          isActive={selectedCategory === category}
        >
          {category}
        </CategoryFilterLink>
      ))}
    </div>
  );
}

function CategoryFilterLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ${
        isActive
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-low text-secondary hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}
