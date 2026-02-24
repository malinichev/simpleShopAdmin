import { api } from '@/shared/api';
import type { Page } from '@/entities/page';

export interface CreatePagePayload {
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: object;
  isPublished?: boolean;
}

export type UpdatePagePayload = Partial<CreatePagePayload>;

export const pagesApi = {
  getPages: async (): Promise<Page[]> => {
    const { data } = await api.get<Page[]>('/pages');
    return data;
  },

  getPage: async (slug: string): Promise<Page> => {
    const { data } = await api.get<Page>(`/pages/admin/${slug}`);
    return data;
  },


  createPage: async (payload: CreatePagePayload): Promise<Page> => {
    const { data } = await api.post<Page>('/pages', payload);
    return data;
  },

  updatePage: async (slug: string, payload: UpdatePagePayload): Promise<Page> => {
    const { data } = await api.patch<Page>(`/pages/${slug}`, payload);
    return data;
  },

  deletePage: async (slug: string): Promise<void> => {
    await api.delete(`/pages/${slug}`);
  },

  uploadPageFile: async (slug: string, file: File): Promise<Page> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Page>(`/pages/${slug}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deletePageFile: async (slug: string, key: string): Promise<Page> => {
    const { data } = await api.delete<Page>(`/pages/${slug}/files`, {
      params: { key },
    });
    return data;
  },
};
