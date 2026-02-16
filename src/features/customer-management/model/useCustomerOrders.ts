import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from '../api/queries';

export function useCustomerOrders(id: string | null) {
  return useQuery({
    queryKey: customerKeys.orders(id!),
    queryFn: () => customersApi.getCustomerOrders(id!, { limit: 10 }),
    enabled: Boolean(id),
  });
}
