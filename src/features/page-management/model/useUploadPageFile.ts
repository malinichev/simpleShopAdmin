import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useUploadPageFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => pagesApi.uploadPageFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.files() });
      toast.success('Файл загружен');
    },
    onError: () => {
      toast.error('Ошибка при загрузке файла');
    },
  });
}
