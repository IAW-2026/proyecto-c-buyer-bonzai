import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { ProductCard } from '@/features/shop/components/product-card';
import { ProductImage } from '@/features/shop/components/product-image';
import {
  getProductAiDescription,
  getProductById,
  getRelatedProducts,
} from '@/features/shop/data/products';
import { formatCurrency } from '@/lib/formatters';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="bg-surface px-4 pb-24 pt-10 text-on-surface sm:px-6 lg:px-8">
      <article className="mx-auto grid max-w-360 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.72fr)] lg:items-start xl:gap-16">
        <div className="space-y-4">
          <Link
            href="/shop"
            className="inline-flex cursor-pointer font-label text-xs uppercase tracking-[0.18em] text-secondary transition hover:text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Back to shop
          </Link>

          <figure className="relative overflow-hidden bg-surface-container-highest">
            <div className="relative aspect-4/5">
              <ProductImage
                imageUrl={product.imageUrl}
                name={product.name}
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 bg-surface/88 p-4 text-primary shadow-[0_20px_45px_rgba(27,28,26,0.08)] backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                Bonzai marketplace piece
              </p>
              <p className="mt-2 font-headline text-2xl leading-none">
                Selected for calm, architectural interiors.
              </p>
            </figcaption>
          </figure>
        </div>

        <section className="bg-surface-container-lowest p-6 sm:p-8 lg:sticky lg:top-8 lg:p-10">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.22em] text-secondary">
            Marketplace selection
          </p>

          <h1 className="mt-5 font-headline text-5xl leading-none tracking-[-0.04em] text-primary sm:text-6xl xl:text-7xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="mt-6 max-w-xl font-body text-base leading-8 text-secondary">
              {product.description}
            </p>
          ) : null}

          <div className="mt-10 border border-outline-variant/70 bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary">
                  Price
                </p>
                <p className="mt-1 font-headline text-4xl leading-none text-primary">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {product.stock > 0 ? (
                <AddToCartButton
                  productId={product.id}
                  className="inline-flex cursor-pointer justify-center rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed justify-center rounded-sm bg-surface-container-high px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-outline"
                >
                  Out of stock
                </button>
              )}
            </div>
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {product.category ? (
              <ProductDetail label="Category" value={product.category.name} />
            ) : null}
            <ProductDetail label="Stock" value={`${product.stock} available`} />
          </dl>
        </section>
      </article>

      <Suspense fallback={<AiDescriptionSkeleton />}>
        <AiDescriptionSection product={product} />
      </Suspense>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection product={product} />
      </Suspense>
    </main>
  );
}

async function AiDescriptionSection({
  product,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductById>>>;
}) {
  const aiDescription = await getProductAiDescription(product);

  return (
    <section className="mx-auto mt-24 max-w-360 bg-surface-container-low px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div className="max-w-md">
          <div className="mb-5 inline-flex items-center gap-3 bg-surface-container-lowest px-4 py-3 text-primary">
            <AiGeneratedIcon />
            <span className="font-label text-[10px] uppercase tracking-[0.22em] text-secondary">
              AI-generated read
            </span>
          </div>
          <p className="mb-3 font-label text-xs uppercase tracking-[0.22em] text-secondary">
            The Bonzai read
          </p>
          <h2 className="font-headline text-4xl leading-tight text-primary sm:text-5xl">
            A living note, composed for this piece.
          </h2>
        </div>
        <p className="max-w-3xl bg-surface px-6 py-7 font-body text-base leading-8 text-secondary sm:px-8 sm:py-9 sm:text-lg sm:leading-9">
          {aiDescription}
        </p>
      </div>
    </section>
  );
}

function AiDescriptionSkeleton() {
  return (
    <section
      className="mx-auto mt-24 max-w-360 bg-surface-container-low px-5 py-12 sm:px-8 lg:px-12 lg:py-14"
      aria-label="Product note loading"
      aria-busy="true"
    >
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div className="max-w-md" aria-hidden="true">
          <div className="mb-5 h-15 w-52 bg-surface-container-lowest" />
          <div className="mb-3 h-4 w-32 bg-surface-container" />
          <div className="h-24 w-full max-w-sm bg-surface-container-high" />
        </div>
        <div className="max-w-3xl bg-surface px-6 py-7 sm:px-8 sm:py-9" aria-hidden="true">
          <div className="space-y-4">
            <div className="h-5 w-full bg-surface-container" />
            <div className="h-5 w-11/12 bg-surface-container" />
            <div className="h-5 w-10/12 bg-surface-container" />
            <div className="h-5 w-3/4 bg-surface-container" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function RelatedProductsSection({
  product,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductById>>>;
}) {
  const relatedProducts = await getRelatedProducts(product);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto mt-20 max-w-360"
      aria-labelledby="related-products-heading"
    >
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 font-label text-xs uppercase tracking-[0.22em] text-secondary">
            Related pieces
          </p>
          <h2
            id="related-products-heading"
            className="font-headline text-4xl leading-tight text-primary sm:text-5xl"
          >
            Continue the collection
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex cursor-pointer font-label text-xs uppercase tracking-[0.18em] text-secondary transition hover:text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          View all products
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}

function RelatedProductsSkeleton() {
  return (
    <section
      className="mx-auto mt-20 max-w-360"
      aria-label="Related products loading"
      aria-busy="true"
    >
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-hidden="true">
        <div>
          <div className="mb-3 h-4 w-32 bg-surface-container" />
          <div className="h-12 w-72 max-w-full bg-surface-container-high" />
        </div>
        <div className="h-4 w-32 bg-surface-container" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <article key={index} className="bg-surface-container-lowest p-4 sm:p-6">
            <div className="mb-6 aspect-4/5 animate-pulse bg-surface-container-highest" />
            <div className="mb-3 h-5 w-24 rounded-full bg-secondary-container/60" />
            <div className="h-8 w-3/4 bg-surface-container-high" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full bg-surface-container" />
              <div className="h-4 w-5/6 bg-surface-container" />
            </div>
            <div className="mt-8 h-7 w-24 bg-surface-container-high" />
          </article>
        ))}
      </div>
    </section>
  );
}

function AiGeneratedIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-full bg-primary text-on-primary"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      >
        <path d="M12 3.5 13.5 8l4.5 1.5-4.5 1.5L12 15.5 10.5 11 6 9.5 10.5 8 12 3.5Z" />
        <path d="M18 14.5 18.8 17l2.2.8-2.2.7L18 21l-.8-2.5-2.2-.7 2.2-.8.8-2.5Z" />
        <path d="M5.5 13.5 6 15l1.5.5L6 16l-.5 1.5L5 16l-1.5-.5L5 15l.5-1.5Z" />
      </svg>
    </span>
  );
}

function ProductDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low px-4 py-3">
      <dt className="font-label text-[10px] uppercase tracking-[0.18em] text-secondary">
        {label}
      </dt>
      <dd className="mt-1 font-body text-sm text-primary">{value}</dd>
    </div>
  );
}
