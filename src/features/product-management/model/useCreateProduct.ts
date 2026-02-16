import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '../api/productsApi';
import { productKeys } from '../api/queries';
import type { ProductFormData } from '../lib/productValidation';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Товар успешно создан');
    },
    onError: () => {
      toast.error('Ошибка при создании товара');
    },
  });
}
