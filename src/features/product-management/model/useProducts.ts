import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ProductQueryParams } from '@/entities/product';
import { productsApi } from '../api/productsApi';
import { productKeys } from '../api/queries';

export function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
}
