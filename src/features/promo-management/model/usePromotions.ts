import { useQuery } from '@tanstack/react-query';
import { promosApi } from '../api/promosApi';
import { promoKeys } from '../api/queries';

export function usePromotions() {
  return useQuery({
    queryKey: promoKeys.lists(),
    queryFn: () => promosApi.getPromotions(),
  });
}
