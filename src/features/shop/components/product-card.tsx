import Link from 'next/link';
import type { Product } from '../types';
import { formatCurrency } from '@/lib/formatters';
import { ProductImage } from './product-image';

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  className = '',
}: ProductCardProps) {
  return (
    <article
      className={`group relative flex h-full cursor-pointer flex-col bg-surface-container-lowest p-4 sm:p-6 ${className}`}
    >
      <Link
        href={`/${product.slug}/${product.id}`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className="sr-only">View {product.name}</span>
      </Link>

      <div className="relative mb-6 aspect-4/5 overflow-hidden bg-surface-container-highest">
        <ProductImage
          imageUrl={product.imageUrl}
          name={product.name}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <ProductCardContent product={product} />
    </article>
  );
}

function ProductCardContent({ product }: { product: Product }) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        {product.category ? (
          <p className="mb-3 font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
            {product.category.name}
          </p>
        ) : null}
        <h2
          className="mb-3 font-headline text-2xl leading-tight text-primary sm:text-3xl"
        >
          {product.name}
        </h2>
        {product.description ? (
          <p className="font-body text-sm leading-6 text-secondary">
            {product.description}
          </p>
        ) : null}
      </div>
      <p className="mt-auto font-headline text-2xl text-primary">
        {formatCurrency(product.price)}
      </p>
    </div>
  );
}

