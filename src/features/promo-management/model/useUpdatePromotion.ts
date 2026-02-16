import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promosApi, type UpdatePromotionPayload } from '../api/promosApi';
import { promoKeys } from '../api/queries';

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionPayload }) =>
      promosApi.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.lists() });
      toast.success('Промокод обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении промокода');
    },
  });
}
