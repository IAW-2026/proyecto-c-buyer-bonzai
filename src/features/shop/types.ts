export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sellerId: string;
  sellerEmail: string | null;
  categoryId: string | null;
  name: string;
  category: string;
  careLabel: string; //TODO Ver si dejarlo o sacarlo
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFragile: boolean;
  tags: string[]; //TODO Ver si dejarlo o sacarlo
  image: ProductImage;
  imageAspect: 'featured' | 'portrait' | 'square'; //TODO Ver si dejarlo o sacarlo
};
