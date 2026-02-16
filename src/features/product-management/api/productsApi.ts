import { api } from '@/shared/api';
import type { Product, ProductQueryParams } from '@/entities/product';
import type { Category } from '@/entities/category';
import type { ProductStatus } from '@/shared/constants';
import type { ProductFormData } from '../lib/productValidation';

interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function toApiPayload(formData: ProductFormData) {
  return {
    name: formData.name,
    slug: formData.slug || undefined,
    description: formData.description,
    shortDescription: formData.shortDescription,
    sku: formData.sku,
    price: formData.price,
    compareAtPrice: formData.comparePrice || undefined,
    categoryId: formData.categoryId,
    tags: formData.tags,
    status: formData.status,
    images: formData.images.map((img, i) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.isMain ? 0 : i + 1,
    })),
    variants: formData.variants.map((v, i) => ({
      id: v.id || `var-${i}`,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex || '#000000',
      sku: v.sku,
      stock: v.stock,
      price: v.price,
    })),
    attributes: {
      material: formData.material,
      activity: formData.activityTypes,
      features: formData.features,
    },
    seo: {
      title: formData.metaTitle || formData.name,
      description: formData.metaDescription || formData.shortDescription || '',
      keywords: formData.metaKeywords ?? [],
    },
  };
}

export const productsApi = {
  getProducts: async (params: ProductQueryParams): Promise<PaginatedProducts> => {
    const { data } = await api.get<PaginatedProducts>('/products', { params });
    return data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    console.log({data})
    return data;
  },

  createProduct: async (productData: ProductFormData): Promise<Product> => {
    const { data } = await api.post<Product>('/products', toApiPayload(productData));
    return data;
  },

  updateProduct: async (id: string, productData: ProductFormData): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, toApiPayload(productData));
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  duplicateProduct: async (id: string): Promise<Product> => {
    const { data } = await api.post<Product>(`/products/${id}/duplicate`);
    return data;
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/products/bulk-delete', { ids });
  },

  bulkUpdateStatus: async (ids: string[], status: ProductStatus): Promise<void> => {
    await api.post('/products/bulk-status', { ids, status });
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
};
