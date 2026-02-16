import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AnalyticsQueryParams, type TopQueryParams, type LowStockParams } from '../api/analyticsApi';
import { analyticsKeys } from '../api/queries';

export function useDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSales(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.sales(params),
    queryFn: () => analyticsApi.getSales(params),
  });
}

export function useVisitors(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.visitors(params),
    queryFn: () => analyticsApi.getVisitors(params),
  });
}

export function useTopProducts(params?: TopQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.topProducts(params),
    queryFn: () => analyticsApi.getTopProducts(params),
  });
}

export function useTopCategories(params?: TopQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.topCategories(params),
    queryFn: () => analyticsApi.getTopCategories(params),
  });
}

export function useCustomerStats() {
  return useQuery({
    queryKey: analyticsKeys.customerStats(),
    queryFn: () => analyticsApi.getCustomerStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStock(params?: LowStockParams) {
  return useQuery({
    queryKey: analyticsKeys.lowStock(params),
    queryFn: () => analyticsApi.getLowStock(params),
    staleTime: 5 * 60 * 1000,
  });
}
