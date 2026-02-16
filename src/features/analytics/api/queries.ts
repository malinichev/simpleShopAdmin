import type { AnalyticsQueryParams, TopQueryParams, LowStockParams } from './analyticsApi';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  sales: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'sales', params] as const,
  visitors: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'visitors', params] as const,
  topProducts: (params?: TopQueryParams) => [...analyticsKeys.all, 'top-products', params] as const,
  topCategories: (params?: TopQueryParams) => [...analyticsKeys.all, 'top-categories', params] as const,
  customerStats: () => [...analyticsKeys.all, 'customer-stats'] as const,
  lowStock: (params?: LowStockParams) => [...analyticsKeys.all, 'low-stock', params] as const,
};
