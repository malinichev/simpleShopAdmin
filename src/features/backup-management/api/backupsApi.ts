import { api } from '@/shared/api';

export interface BackupItem {
  /** Идентификатор = имя файла (backup-YYYYMMDD-HHmmss[-N].json.gz) */
  id: string;
  createdAt: string;
  sizeBytes: number;
  tableCount: number;
  rowCount: number;
}

export interface RestoreResult {
  restoredTables: string[];
  skippedTables: string[];
  excludedTables: string[];
  restoredRows: number;
  keptSuperAdmins: number;
  currentOrdersKept: number;
  durationMs: number;
}

export interface RestoreOptions {
  /** false (по умолчанию) — текущие заказы сохраняются */
  includeOrders?: boolean;
}

export const backupsApi = {
  getBackups: async (): Promise<BackupItem[]> => {
    const { data } = await api.get<BackupItem[]>('/backups');
    return data;
  },

  createBackup: async (): Promise<BackupItem> => {
    const { data } = await api.post<BackupItem>('/backups');
    return data;
  },

  restoreBackup: async (
    id: string,
    options: RestoreOptions = {},
  ): Promise<RestoreResult> => {
    const { data } = await api.post<RestoreResult>(
      `/backups/${encodeURIComponent(id)}/restore`,
      { includeOrders: options.includeOrders ?? false },
    );
    return data;
  },

  deleteBackup: async (id: string): Promise<void> => {
    await api.delete(`/backups/${encodeURIComponent(id)}`);
  },

  uploadBackup: async (file: File): Promise<BackupItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<BackupItem>('/backups/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** Скачивание через axios blob (Bearer-токен нельзя передать в href-ссылке) */
  downloadBackup: async (backup: BackupItem): Promise<void> => {
    const { data } = await api.get(
      `/backups/${encodeURIComponent(backup.id)}/download`,
      {
        responseType: 'blob',
      },
    );
    const url = URL.createObjectURL(data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.id;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
