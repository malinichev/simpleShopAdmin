import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsApi } from '../api/settingsApi';
import type {
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from '../api/settingsApi';
import { settingsKeys } from '../api/queries';

export function usePaymentMethods() {
  return useQuery({
    queryKey: settingsKeys.payment(),
    queryFn: () => settingsApi.getPaymentMethods(),
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentMethodPayload) =>
      settingsApi.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.payment() });
      toast.success('Способ оплаты добавлен');
    },
    onError: () => {
      toast.error('Ошибка при создании способа оплаты');
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodPayload }) =>
      settingsApi.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.payment() });
      toast.success('Способ оплаты обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении способа оплаты');
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.payment() });
      toast.success('Способ оплаты удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении способа оплаты');
    },
  });
}
