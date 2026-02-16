import { api } from '@/shared/api';
import type { Category } from '@/entities/category';
import type { CategoryFormData } from '../lib/categoryValidation';

interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

function toApiPayload(data: CategoryFormData): CreateCategoryPayload {
  return {
    name: data.name,
    slug: data.slug || undefined,
    description: data.description || undefined,
    image: data.image || undefined,
    parentId: data.parentId || undefined,
    isActive: data.isActive,
    seo: data.seoTitle
      ? {
          title: data.seoTitle,
          description: data.seoDescription || '',
          keywords: [],
        }
      : undefined,
  };
}

export const categoriesApi = {
  getTree: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories/tree');
    return data;
  },

  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  createCategory: async (formData: CategoryFormData): Promise<Category> => {
    const { data } = await api.post<Category>('/categories', toApiPayload(formData));
    return data;
  },

  updateCategory: async (id: string, formData: CategoryFormData): Promise<Category> => {
    const { data } = await api.patch<Category>(`/categories/${id}`, toApiPayload(formData));
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  reorder: async (items: { id: string; order: number }[]): Promise<void> => {
    await api.patch('/categories/reorder', { items });
  },
};
