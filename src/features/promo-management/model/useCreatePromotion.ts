import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promosApi, type CreatePromotionPayload } from '../api/promosApi';
import { promoKeys } from '../api/queries';

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionPayload) => promosApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.lists() });
      toast.success('Промокод создан');
    },
    onError: () => {
      toast.error('Ошибка при создании промокода');
    },
  });
}
