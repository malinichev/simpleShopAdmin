import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsApi } from '../api/reviewsApi';
import { reviewKeys } from '../api/queries';

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success('Отзыв одобрен');
    },
    onError: () => {
      toast.error('Ошибка при одобрении отзыва');
    },
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      reviewsApi.replyToReview(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success('Ответ опубликован');
    },
    onError: () => {
      toast.error('Ошибка при отправке ответа');
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success('Отзыв удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении отзыва');
    },
  });
}
