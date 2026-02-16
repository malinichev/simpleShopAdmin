import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { OrderStatus } from '@/shared/constants';
import { orderStatuses } from '@/shared/constants';
import { ordersApi } from '../api/ordersApi';
import { orderKeys } from '../api/queries';

interface UpdateStatusParams {
  id: string;
  status: OrderStatus;
  comment?: string;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, comment }: UpdateStatusParams) =>
      ordersApi.updateOrderStatus(id, status, comment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Статус изменён на «${orderStatuses[variables.status].label}»`);
    },
    onError: () => {
      toast.error('Ошибка при изменении статуса');
    },
  });
}
