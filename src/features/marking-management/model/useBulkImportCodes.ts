import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { markingApi } from '../api/markingApi';
import { markingKeys } from '../api/queries';

export function useBulkImportCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, codes }: { variantId: string; codes: string[] }) =>
      markingApi.bulkCreate(variantId, codes),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: markingKeys.all });
      toast.success(
        `Импортировано: ${result.created}. Дубликатов: ${result.duplicates}`,
      );
    },
    onError: () => {
      toast.error('Ошибка при импорте кодов');
    },
  });
}
