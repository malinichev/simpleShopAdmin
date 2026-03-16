import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importApi } from '../api/importApi';
import { importKeys } from '../api/queries';

export function useStartImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      fileKey: string;
      mapping: Record<string, string>;
      defaultStatus?: string;
      skipDuplicates?: boolean;
    }) => importApi.start(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.jobs() });
      toast.success('Импорт запущен');
    },
    onError: () => {
      toast.error('Ошибка при запуске импорта');
    },
  });
}
