import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useDeletePageFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => pagesApi.deletePageFile(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.files() });
      toast.success('Файл удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении файла');
    },
  });
}
