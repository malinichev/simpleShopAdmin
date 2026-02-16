export type PromotionType = 'percentage' | 'fixed' | 'free_shipping';

export interface Promotion {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  categoryIds: string[];
  productIds: string[];
  excludeProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
