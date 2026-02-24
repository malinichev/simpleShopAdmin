import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useDeletePageFile(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => pagesApi.deletePageFile(slug, key),
    onSuccess: (updatedPage) => {
      queryClient.setQueryData(pageKeys.detail(slug), updatedPage);
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      toast.success('Файл удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении файла');
    },
  });
}
