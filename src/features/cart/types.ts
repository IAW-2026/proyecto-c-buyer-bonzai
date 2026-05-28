import type { Product } from '@/features/shop/types';

export type CartLineItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  unitPrice: number;
  lineTotal: number;
};

export type CartViewModel = {
  items: CartLineItem[];
  productsTotal: number;
  shippingTotal: number;
  grandTotal: number;
  totalQuantity: number;
};
