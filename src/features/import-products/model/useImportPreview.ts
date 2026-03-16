import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importApi } from '../api/importApi';

export function useImportPreview() {
  return useMutation({
    mutationFn: (file: File) => importApi.preview(file),
    onError: () => {
      toast.error('Ошибка при разборе CSV файла');
    },
  });
}
