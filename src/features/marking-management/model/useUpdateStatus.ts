import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { markingApi, type MarkingCodeStatus } from '../api/markingApi';
import { markingKeys } from '../api/queries';

export function useUpdateMarkingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MarkingCodeStatus }) =>
      markingApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markingKeys.all });
      toast.success('Статус обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });
}

export function useBulkUpdateMarkingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      status,
    }: {
      ids: string[];
      status: MarkingCodeStatus;
    }) => markingApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markingKeys.all });
      toast.success('Статусы обновлены');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статусов');
    },
  });
}
