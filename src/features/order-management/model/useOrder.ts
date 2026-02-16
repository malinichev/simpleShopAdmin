import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { orderKeys } from '../api/queries';

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: Boolean(id),
  });
}
