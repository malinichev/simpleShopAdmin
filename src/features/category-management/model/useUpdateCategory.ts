import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categoriesApi';
import { categoryKeys } from '../api/queries';
import type { CategoryFormData } from '../lib/categoryValidation';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Категория обновлена');
    },
    onError: () => {
      toast.error('Ошибка при обновлении категории');
    },
  });
}
