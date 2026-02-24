import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi, type CreatePagePayload } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePagePayload) => pagesApi.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      toast.success('Страница создана');
    },
    onError: () => {
      toast.error('Ошибка при создании страницы');
    },
  });
}
