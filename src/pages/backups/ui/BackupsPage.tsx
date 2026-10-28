import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  DatabaseBackup,
  Download,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  Modal,
  Skeleton,
} from '@/shared/ui';
import { formatDate, formatDateTime } from '@/shared/lib/utils/date';
import { ROUTES } from '@/shared/config';
import { useAuth } from '@/features/auth';
import {
  useBackups,
  useCreateBackup,
  useDeleteBackup,
  useDownloadBackup,
  useRestoreBackup,
  useUploadBackup,
  type BackupItem,
} from '@/features/backup-management';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function BackupsPage() {
  const { user } = useAuth();
  const { data: backups, isLoading } = useBackups();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();
  const deleteBackup = useDeleteBackup();
  const uploadBackup = useUploadBackup();
  const downloadBackup = useDownloadBackup();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreTarget, setRestoreTarget] = useState<BackupItem | null>(null);
  const [includeOrders, setIncludeOrders] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackupItem | null>(null);

  const openRestoreDialog = (backup: BackupItem) => {
    setIncludeOrders(false);
    setRestoreTarget(backup);
  };

  // Страница доступна только главным администраторам (сервер тоже отдаёт 403)
  if (user && user.role !== 'super_admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleFileSelected = (file: File | undefined) => {
    if (file) uploadBackup.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    try {
      await restoreBackup.mutateAsync({
        id: restoreTarget.id,
        includeOrders,
      });
    } finally {
      setRestoreTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBackup.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Резервные копии
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Бэкапы базы данных: создание, скачивание и восстановление.
            Ваши email и пароль при восстановлении не меняются.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".gz,.json,application/gzip,application/json"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={uploadBackup.isPending}
          >
            <Upload className="h-4 w-4" />
            Загрузить файл
          </Button>
          <Button
            onClick={() => createBackup.mutate()}
            loading={createBackup.isPending}
          >
            <DatabaseBackup className="h-4 w-4" />
            Создать копию
          </Button>
        </div>
      </div>

      {/* List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Файлы бэкапов</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Файл
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Дата создания
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Размер
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Таблиц
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Строк
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(backups ?? []).map((backup) => (
                    <tr
                      key={backup.id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                        {backup.id}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(backup.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(backup.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {formatSize(backup.sizeBytes)}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {backup.tableCount}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {backup.rowCount.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Скачать"
                            onClick={() => downloadBackup.mutate(backup)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Восстановить"
                            onClick={() => openRestoreDialog(backup)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Удалить"
                            onClick={() => setDeleteTarget(backup)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(backups ?? []).length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-sm text-gray-400"
                      >
                        Резервных копий ещё нет — создайте первую
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore confirmation */}
      <Modal
        open={restoreTarget !== null}
        onClose={() => setRestoreTarget(null)}
        title="Восстановить базу данных?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setRestoreTarget(null)}
              disabled={restoreBackup.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestoreConfirm}
              loading={restoreBackup.isPending}
            >
              Восстановить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {restoreTarget
              ? `Данные будут заменены состоянием на ${formatDateTime(
                  restoreTarget.createdAt,
                )}. Ваш email, пароль и текущий вход сохранятся.`
              : ''}
          </p>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <Checkbox
              checked={includeOrders}
              onCheckedChange={setIncludeOrders}
              label="Восстановить также заказы"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {includeOrders
                ? 'Заказы будут заменены состояниями из бэкапа — заказы, созданные после копии, исчезнут.'
                : 'Без галочки текущие заказы сохраняются: откатятся только каталог, настройки и остальные данные.'}
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Удалить резервную копию?"
        description={
          deleteTarget
            ? `Файл ${deleteTarget.id} будет удалён безвозвратно.`
            : ''
        }
        confirmText="Удалить"
        variant="danger"
        loading={deleteBackup.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
