import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useImportJobs } from '../model/useImportJobs';
import type { ImportJob } from '../api/importApi';

const statusIcons: Record<ImportJob['status'], React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  processing: <Loader2 className="h-4 w-4 animate-spin text-primary-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusLabels: Record<ImportJob['status'], string> = {
  pending: 'Ожидание',
  processing: 'Обработка',
  completed: 'Завершён',
  failed: 'Ошибка',
};

interface ImportHistoryProps {
  onSelectJob: (id: string) => void;
}

export function ImportHistory({ onSelectJob }: ImportHistoryProps) {
  const { data, isLoading } = useImportJobs();

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Загрузка...</div>;
  }

  const jobs = data?.data ?? [];

  if (jobs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Нет предыдущих импортов
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <th className="px-3 py-2 text-left font-medium text-gray-500">Файл</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Статус</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Результат</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Дата</th>
            <th className="px-3 py-2 w-20" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                {job.fileName}
              </td>
              <td className="px-3 py-2">
                <span className="flex items-center gap-1.5">
                  {statusIcons[job.status]}
                  <span className="text-xs">{statusLabels[job.status]}</span>
                </span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-500">
                {job.successCount} / {job.totalRows}
                {job.errorCount > 0 && (
                  <span className="ml-1 text-red-500">({job.errorCount} ошибок)</span>
                )}
              </td>
              <td className="px-3 py-2 text-xs text-gray-500">
                {new Date(job.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectJob(job.id)}
                >
                  Детали
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
