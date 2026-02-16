import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from '../api/queries';

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
}
