import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promosApi } from '../api/promosApi';
import { promoKeys } from '../api/queries';

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promosApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.lists() });
      toast.success('Промокод удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении промокода');
    },
  });
}
