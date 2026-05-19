import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../types';
import { formatCurrency } from '@/lib/formatters';

type ProductCardProps = {
  product: Product;
  variant?: 'featured' | 'standard';
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  variant = 'standard',
  priority = false,
  className = '',
}: ProductCardProps) {
  const isFeatured = variant === 'featured';
  const imageFrameClassName = isFeatured
    ? 'aspect-[16/10]'
    : product.imageAspect === 'portrait'
      ? 'aspect-[4/5]'
      : 'aspect-square';
  const imageSizes = isFeatured ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw';

  return (
    <article className={`group relative cursor-pointer bg-surface-container-lowest p-4 sm:p-6 ${className}`}>
      <Link
        href={`/p/${product.id}`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className="sr-only">View {product.name}</span>
      </Link>

      <div className={`relative mb-6 overflow-hidden bg-surface-container-highest ${imageFrameClassName}`}>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          priority={priority}
          sizes={imageSizes}
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            isFeatured ? 'grayscale-20 group-hover:grayscale-0' : ''
          }`}
        />
      </div>

      {isFeatured ? <FeaturedProductContent product={product} /> : <StandardProductContent product={product} />}
    </article>
  );
}

function FeaturedProductContent({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-xl">
        <ProductTags tags={product.tags} />
        <h2 className="mb-3 font-headline text-3xl leading-tight text-primary">{product.name}</h2>
        <p className="font-body text-sm leading-6 text-secondary">{product.description}</p>
      </div>
      <div className="shrink-0 lg:text-right">
        <p className="mb-4 font-headline text-2xl text-primary">{formatCurrency(product.price)}</p>
        <button
          type="button"
          className="relative z-20 inline-flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Add to Bag
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

function StandardProductContent({ product }: { product: Product }) {
  return (
    <div>
      <h2 className="mb-1 font-headline text-xl leading-tight text-primary">{product.name}</h2>
      <p className="mb-4 font-label text-xs uppercase tracking-[0.18em] text-secondary">
        {product.careLabel}
      </p>
      <div className="flex items-center justify-between gap-4">
        <p className="font-headline text-lg text-primary">{formatCurrency(product.price)}</p>
        <button
          type="button"
          className="relative z-20 cursor-pointer font-label text-xs uppercase tracking-[0.16em] text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-secondary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Quick Add
        </button>
      </div>
    </div>
  );
}

function ProductTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-secondary-container px-2 py-0.5 font-label text-[10px] uppercase tracking-[0.18em] text-on-secondary-container"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
