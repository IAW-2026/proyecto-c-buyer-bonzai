import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCuratedProductById } from '@/features/shop/data/products';
import { formatCurrency } from '@/lib/formatters';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getCuratedProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="bg-surface px-4 py-12 text-on-surface sm:px-6 lg:px-8">
      <article className="mx-auto grid max-w-360 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.55fr)] lg:items-start">
        <div className="relative aspect-4/3 overflow-hidden bg-surface-container-highest">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover"
          />
        </div>

        <section className="bg-surface-container-lowest p-6 sm:p-8">
          <Link
            href="/"
            className="mb-8 inline-flex cursor-pointer font-label text-xs uppercase tracking-[0.16em] text-secondary transition hover:text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Back to shop
          </Link>

          <p className="mb-3 font-label text-xs uppercase tracking-[0.18em] text-secondary">
            {product.category} / {product.careLabel}
          </p>
          <h1 className="font-headline text-5xl leading-none tracking-[-0.04em] text-primary md:text-6xl">
            {product.name}
          </h1>
          <p className="mt-6 text-base leading-8 text-secondary">
            {product.description}
          </p>
          <p className="mt-8 font-headline text-3xl text-primary">
            {formatCurrency(product.price)}
          </p>

          <button
            type="button"
            className="mt-8 inline-flex cursor-pointer rounded-sm bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Add to Bag
          </button>
        </section>
      </article>
    </main>
  );
}
