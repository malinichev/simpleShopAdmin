import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsApi } from '../api/settingsApi';
import type {
  CreateShippingMethodPayload,
  UpdateShippingMethodPayload,
} from '../api/settingsApi';
import { settingsKeys } from '../api/queries';

export function useShippingMethods() {
  return useQuery({
    queryKey: settingsKeys.shipping(),
    queryFn: () => settingsApi.getShippingMethods(),
  });
}

export function useCreateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShippingMethodPayload) =>
      settingsApi.createShippingMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.shipping() });
      toast.success('Способ доставки добавлен');
    },
    onError: () => {
      toast.error('Ошибка при создании способа доставки');
    },
  });
}

export function useUpdateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShippingMethodPayload }) =>
      settingsApi.updateShippingMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.shipping() });
      toast.success('Способ доставки обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении способа доставки');
    },
  });
}

export function useDeleteShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteShippingMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.shipping() });
      toast.success('Способ доставки удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении способа доставки');
    },
  });
}
