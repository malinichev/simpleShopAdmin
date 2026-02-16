import { api } from '@/shared/api';
import type { Promotion } from '@/entities/promotion';

export interface CreatePromotionPayload {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  categoryIds?: string[];
  productIds?: string[];
  excludeProductIds?: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;

export const promosApi = {
  getPromotions: async (): Promise<Promotion[]> => {
    const { data } = await api.get<Promotion[]>('/promotions');
    return data;
  },

  getPromotion: async (id: string): Promise<Promotion> => {
    const { data } = await api.get<Promotion>(`/promotions/${id}`);
    return data;
  },

  createPromotion: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    const { data } = await api.post<Promotion>('/promotions', payload);
    return data;
  },

  updatePromotion: async (id: string, payload: UpdatePromotionPayload): Promise<Promotion> => {
    const { data } = await api.patch<Promotion>(`/promotions/${id}`, payload);
    return data;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },
};
