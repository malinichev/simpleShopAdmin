import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { OrderQueryParams } from '@/entities/order';
import { ordersApi } from '../api/ordersApi';
import { orderKeys } from '../api/queries';

export function useOrders(params: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: keepPreviousData,
  });
}
