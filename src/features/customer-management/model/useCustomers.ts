import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { CustomerQueryParams } from '@/entities/customer';
import { customersApi } from '../api/customersApi';
import { customerKeys } from '../api/queries';

export function useCustomers(params: CustomerQueryParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.getCustomers(params),
    placeholderData: keepPreviousData,
  });
}
