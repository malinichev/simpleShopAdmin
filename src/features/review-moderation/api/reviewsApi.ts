import { api } from '@/shared/api';
import type { Review, ReviewQueryParams } from '@/entities/review';

interface PaginatedReviews {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  getReviews: async (params: ReviewQueryParams): Promise<PaginatedReviews> => {
    const { data } = await api.get<PaginatedReviews>('/reviews', { params });
    return data;
  },

  approveReview: async (id: string): Promise<Review> => {
    const { data } = await api.patch<Review>(`/reviews/${id}/approve`);
    return data;
  },

  replyToReview: async (id: string, text: string): Promise<Review> => {
    const { data } = await api.post<Review>(`/reviews/${id}/reply`, { text });
    return data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
