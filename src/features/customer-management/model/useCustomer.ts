import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from '../api/queries';

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => customersApi.getCustomer(id!),
    enabled: Boolean(id),
  });
}
