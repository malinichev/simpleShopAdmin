import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importApi } from '../api/importApi';

export function useDetectDuplicates() {
  return useMutation({
    mutationFn: (params: {
      fileKey: string;
      mapping: Record<string, string>;
    }) => importApi.detectDuplicates(params),
    onError: () => {
      toast.error('Ошибка при проверке дубликатов');
    },
  });
}
