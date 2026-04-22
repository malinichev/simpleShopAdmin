import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { productsApi } from '../api/productsApi';
import { productKeys } from '../api/queries';
import type { ProductFormData } from '../lib/productValidation';

function extractApiMessage(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const msg = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string' && msg.length > 0) return msg;
    return error.message;
  }
  return undefined;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Товар успешно обновлён');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении товара', {
        description: extractApiMessage(error),
      });
    },
  });
}
