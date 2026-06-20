import Image from 'next/image';

const PRODUCT_IMAGE_PLACEHOLDER = '/images/product-placeholder.svg';

type ProductImageProps = {
  imageUrl: string | null;
  name: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function ProductImage({
  imageUrl,
  name,
  priority = false,
  sizes,
  className = 'object-cover',
}: ProductImageProps) {
  const isPlaceholder = !imageUrl;

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-pulse bg-surface-container-high"
      />
      <Image
        src={imageUrl ?? PRODUCT_IMAGE_PLACEHOLDER}
        alt={isPlaceholder ? `${name} product image placeholder` : `${name} product photo`}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    </>
  );
}
