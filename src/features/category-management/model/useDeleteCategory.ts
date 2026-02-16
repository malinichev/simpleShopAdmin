import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categoriesApi';
import { categoryKeys } from '../api/queries';

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Категория удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении. Возможно, категория содержит подкатегории.');
    },
  });
}
