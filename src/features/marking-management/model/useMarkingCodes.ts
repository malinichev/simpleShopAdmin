import { useQuery } from '@tanstack/react-query';
import { markingApi, type MarkingQueryParams } from '../api/markingApi';
import { markingKeys } from '../api/queries';

export function useMarkingCodes(params: MarkingQueryParams) {
  return useQuery({
    queryKey: markingKeys.list(params),
    queryFn: () => markingApi.getCodes(params),
  });
}

export function useMarkingStats(productId?: string, variantId?: string) {
  return useQuery({
    queryKey: markingKeys.stats(productId, variantId),
    queryFn: () => markingApi.getStats(productId, variantId),
  });
}
