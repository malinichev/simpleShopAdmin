import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => pagesApi.deletePage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      toast.success('Страница удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении страницы');
    },
  });
}
