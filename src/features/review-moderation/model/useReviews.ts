import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ReviewQueryParams } from '@/entities/review';
import { reviewsApi } from '../api/reviewsApi';
import { reviewKeys } from '../api/queries';

export function useReviews(params: ReviewQueryParams) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewsApi.getReviews(params),
    placeholderData: keepPreviousData,
  });
}
