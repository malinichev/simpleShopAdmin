import { CheckCircle, XCircle, Loader2, Ban } from 'lucide-react';
import type { SimaJob } from '../api/simaImportApi';
import { useSimaJobs } from '../model/hooks';

const STATUS_LABEL: Record<SimaJob['status'], string> = {
  pending: 'ожидание',
  processing: 'выполняется',
  completed: 'завершено',
  failed: 'ошибка',
  canceled: 'отменено',
};

export function SimaImportHistory({
  onSelectJob,
}: {
  onSelectJob: (id: string) => void;
}) {
  const { data, isLoading } = useSimaJobs();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Загрузка истории…</p>;
  }
  const jobs = data?.data ?? [];
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Загрузок с Сималенда пока не было. Скачайте выгрузку на сайте поставщика
        (категория → кнопка выгрузки) и загрузите её здесь.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="px-2 py-1.5 font-medium">Статус</th>
            <th className="px-2 py-1.5 font-medium">Файл</th>
            <th className="px-2 py-1.5 font-medium">Создано / обновлено</th>
            <th className="px-2 py-1.5 font-medium">Ошибки</th>
            <th className="px-2 py-1.5 font-medium">Длительность</th>
            <th className="px-2 py-1.5 font-medium" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const durMs =
              job.startedAt && job.finishedAt
                ? new Date(job.finishedAt).getTime() -
                  new Date(job.startedAt).getTime()
                : null;
            return (
              <tr
                key={job.id}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    {job.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {job.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {job.status === 'canceled' && (
                      <Ban className="h-4 w-4 text-gray-400" />
                    )}
                    {(job.status === 'processing' || job.status === 'pending') && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                    )}
                    {STATUS_LABEL[job.status]}
                  </span>
                </td>
                <td className="max-w-56 truncate px-2 py-1.5 text-gray-600 dark:text-gray-400">
                  {job.fileName}
                </td>
                <td className="px-2 py-1.5">
                  <span className="font-medium text-green-600">
                    +{job.createdCount}
                  </span>{' '}
                  /{' '}
                  <span className="font-medium text-blue-600">
                    ~{job.updatedCount}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-red-600">{job.errorCount}</td>
                <td className="px-2 py-1.5 text-gray-500">
                  {durMs ? `${Math.round(durMs / 60000)} мин` : '—'}
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:underline"
                    onClick={() => onSelectJob(job.id)}
                  >
                    Детали
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
