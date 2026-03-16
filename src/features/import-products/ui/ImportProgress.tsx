import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { ImportJob } from '../api/importApi';

interface ImportProgressProps {
  job: ImportJob;
}

export function ImportProgress({ job }: ImportProgressProps) {
  const percentage =
    job.totalRows > 0
      ? Math.round((job.processedRows / job.totalRows) * 100)
      : 0;

  const isActive = job.status === 'processing' || job.status === 'pending';

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center gap-3">
        {job.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
        {job.status === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
        {isActive && <Loader2 className="h-6 w-6 animate-spin text-primary-500" />}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {job.status === 'pending' && 'Ожидание обработки...'}
            {job.status === 'processing' && 'Импорт в процессе...'}
            {job.status === 'completed' && 'Импорт завершён'}
            {job.status === 'failed' && 'Импорт не удался'}
          </p>
          <p className="text-sm text-gray-500">
            {job.fileName}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-500">Прогресс</span>
          <span className="text-gray-700 dark:text-gray-300">
            {job.processedRows} / {job.totalRows} ({percentage}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              job.status === 'failed'
                ? 'bg-red-500'
                : job.status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-primary-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Успешно</p>
          <p className="text-lg font-semibold text-green-600">{job.successCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Ошибки</p>
          <p className="text-lg font-semibold text-red-600">{job.errorCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Всего строк</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.totalRows}</p>
        </div>
      </div>

      {/* Errors list */}
      {job.errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ошибки ({job.errors.length})
            </h4>
          </div>
          <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Строка</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Поле</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {job.errors.map((err, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{err.row}</td>
                    <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{err.field || '—'}</td>
                    <td className="px-3 py-1.5 text-red-600">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
