import type { MarkingQueryParams } from './markingApi';

export const markingKeys = {
  all: ['marking'] as const,
  lists: () => [...markingKeys.all, 'list'] as const,
  list: (params: MarkingQueryParams) => [...markingKeys.lists(), params] as const,
  stats: (productId?: string, variantId?: string) =>
    [...markingKeys.all, 'stats', { productId, variantId }] as const,
};
