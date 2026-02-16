export interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  seo?: CategorySEO;
  children?: Category[];
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}
