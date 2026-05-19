export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  careLabel: string;
  description: string;
  price: number;
  tags: string[];
  image: ProductImage;
  imageAspect: 'featured' | 'portrait' | 'square';
};