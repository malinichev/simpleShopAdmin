import type { ProductStatus } from '@/shared/constants';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface ProductAttributes {
  material: string;
  activity: string[];
  features: string[];
  careInstructions?: string;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttributes;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  status: ProductStatus;
  seo: ProductSEO;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductSortOption =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'popular'
  | 'rating';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ProductStatus;
  sort?: ProductSortOption;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  activity?: string[];
  inStock?: boolean;
}
