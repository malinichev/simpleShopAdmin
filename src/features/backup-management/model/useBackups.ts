import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  backupsApi,
  type BackupItem,
  type RestoreOptions,
} from '../api/backupsApi';
import { backupKeys } from '../api/queries';

export function useBackups() {
  return useQuery({
    queryKey: backupKeys.list(),
    queryFn: backupsApi.getBackups,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => backupsApi.createBackup(),
    onSuccess: (backup) => {
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
      toast.success(
        `Резервная копия создана (${backup.tableCount} таблиц, ${backup.rowCount} строк)`,
      );
    },
    onError: () => {
      toast.error('Ошибка при создании резервной копии');
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string } & RestoreOptions) =>
      backupsApi.restoreBackup(input.id, input),
    onSuccess: (result) => {
      // Вся БД вернулась в прошлое состояние — инвалидируем всё
      queryClient.invalidateQueries();
      toast.success(
        result.excludedTables.length > 0
          ? `База восстановлена без заказов: текущие заказы сохранены (${result.currentOrdersKept}). ` +
              'Рекомендуем обновить страницу'
          : `База восстановлена: ${result.restoredTables.length} таблиц, ` +
              `${result.restoredRows} строк. Рекомендуем обновить страницу`,
      );
    },
    onError: () => {
      toast.error('Ошибка при восстановлении (данные не изменены)');
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backupsApi.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
      toast.success('Резервная копия удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении копии');
    },
  });
}

export function useUploadBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => backupsApi.uploadBackup(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
      toast.success('Файл бэкапа загружен');
    },
    onError: () => {
      toast.error('Не удалось загрузить файл (проверьте, что это файл бэкапа)');
    },
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: (backup: BackupItem) => backupsApi.downloadBackup(backup),
    onSuccess: () => {
      toast.success('Скачивание начато');
    },
    onError: () => {
      toast.error('Ошибка при скачивании');
    },
  });
}
