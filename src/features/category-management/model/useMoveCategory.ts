import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/shared/api';
import { categoryKeys } from '../api/queries';

interface MoveCategoryParams {
  id: string;
  parentId: string | null;
  order: number;
}

export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, parentId, order }: MoveCategoryParams) => {
      await api.patch(`/categories/${id}`, {
        parentId: parentId ?? undefined,
        order,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: () => {
      toast.error('Ошибка при перемещении категории');
    },
  });
}
