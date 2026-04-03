import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { orderKeys } from '../api/queries';

export function useOrderMarkingCodes(orderId: string) {
  return useQuery({
    queryKey: orderKeys.markingCodes(orderId),
    queryFn: () => ordersApi.getOrderMarkingCodes(orderId),
    enabled: Boolean(orderId),
  });
}
