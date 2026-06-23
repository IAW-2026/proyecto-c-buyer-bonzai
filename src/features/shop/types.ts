export type ProductCategory = {
  id: string;
  name: string;
};

export type ProductSeller = {
  id: string;
  email: string;
  approved?: boolean;
  suspended?: boolean;
};

export type Product = {
  id: string;
  sellerId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  isFragile: boolean;
  suspended: boolean;
  moderationStatus: string;
  moderationNote: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category: ProductCategory | null;
  seller: ProductSeller;
};
