import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsApi } from '../api/settingsApi';
import type { UpdateSettingsPayload } from '../api/settingsApi';
import { settingsKeys } from '../api/queries';

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.general(),
    queryFn: () => settingsApi.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsPayload) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.general() });
      toast.success('Настройки сохранены');
    },
    onError: () => {
      toast.error('Ошибка при сохранении настроек');
    },
  });
}
