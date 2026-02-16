import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categoriesApi';
import { categoryKeys } from '../api/queries';

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      categoriesApi.reorder(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: () => {
      toast.error('Ошибка при изменении порядка');
    },
  });
}
