import 'server-only';

import type { Product } from '@/features/shop/types';
import { generateProductDescription } from '@/features/shop/ai/product-descriptions';
import {
  browseSellerProducts,
  getSellerCategories,
  getSellerProductById,
  type ProductBrowseResult,
} from '@/server/services/seller-api';

const DEFAULT_PRODUCT_LIMIT = 100;

export async function getProducts() {
  const result = await browseSellerProducts({ limit: DEFAULT_PRODUCT_LIMIT });

  return result.products;
}

export async function getProductById(id: string) {
  return getSellerProductById(id);
}

export async function getProductAiDescription(product: Product) {
  return generateProductDescription({
    name: product.name,
    category: product.category,
    careLabel: product.careLabel,
    tags: product.tags,
    imageAlt: product.image.alt,
  });
}

export async function getRelatedProducts(product: Product, limit = 3) {
  const products = await getProducts();
  const productTags = new Set(product.tags);

  return products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score:
        (candidate.categoryId === product.categoryId ? 4 : 0) +
        (candidate.category === product.category ? 2 : 0) +
        candidate.tags.filter((tag) => productTags.has(tag)).length,
    }))
    .sort(
      (current, next) =>
        next.score - current.score ||
        current.product.name.localeCompare(next.product.name),
    )
    .slice(0, limit)
    .map(({ product: candidate }) => candidate);
}

export async function getProductCategories() {
  return getSellerCategories();
}

export type ProductSearchItem = {
  id: string;
  label: string;
  type: 'product' | 'category' | 'tag';
  detail?: string;
};

export async function getProductSearchItems(): Promise<ProductSearchItem[]> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);
  const tags = Array.from(
    new Set(products.flatMap((product) => product.tags)),
  ).sort();

  return [
    ...products.map((product) => ({
      id: product.id,
      label: product.name,
      type: 'product' as const,
      detail: product.category,
    })),
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      type: 'category' as const,
      detail: 'Category',
    })),
    ...tags.map((tag) => ({
      id: tag,
      label: tag,
      type: 'tag' as const,
      detail: 'Care note',
    })),
  ];
}

export async function searchProducts({
  query,
  categoryId,
  page = 1,
  limit = 20,
}: {
  query?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<ProductBrowseResult> {
  return browseSellerProducts({
    search: query,
    categoryId,
    page,
    limit,
  });
}
