import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categoriesApi';
import { categoryKeys } from '../api/queries';
import type { CategoryFormData } from '../lib/categoryValidation';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryFormData) => categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Категория создана');
    },
    onError: () => {
      toast.error('Ошибка при создании категории');
    },
  });
}
