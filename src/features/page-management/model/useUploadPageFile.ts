import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useUploadPageFile(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => pagesApi.uploadPageFile(slug, file),
    onSuccess: (updatedPage) => {
      queryClient.setQueryData(pageKeys.detail(slug), updatedPage);
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      toast.success('Файл загружен');
    },
    onError: () => {
      toast.error('Ошибка при загрузке файла');
    },
  });
}
