import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersApi } from '../api/ordersApi';
import { orderKeys } from '../api/queries';

interface UpdateAdminNoteParams {
  id: string;
  adminNote: string;
}

export function useUpdateAdminNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: UpdateAdminNoteParams) =>
      ordersApi.updateAdminNote(id, adminNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      toast.success('Заметка сохранена');
    },
    onError: () => {
      toast.error('Ошибка при сохранении заметки');
    },
  });
}
