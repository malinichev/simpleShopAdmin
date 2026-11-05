import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { ROUTES } from '@/shared/config';
import type { SimaJob } from '../api/simaImportApi';
import { useCancelSimaImport } from '../model/hooks';
import {
  SIMA_PHASES,
  simaPhaseIndex,
  simaPhaseCounters,
  simaOverallPercent,
} from '../lib/progress';

interface SimaJobProgressProps {
  job: SimaJob;
}

/** ETA по скорости текущей фазы (startedAt → now / done × остаток). */
function etaText(job: SimaJob): string {
  if (!job.startedAt || job.status !== 'processing') return '';
  const elapsedMs = Date.now() - new Date(job.startedAt).getTime();
  const [done, total] = simaPhaseCounters(job, job.phase);
  if (job.phase === 'done' || done < 3 || total <= done) return '';
  const perItem = elapsedMs / done;
  const remainMs = perItem * (total - done);
  const min = Math.round(remainMs / 60_000);
  if (min < 1) return 'меньше минуты';
  if (min > 90) return `~${Math.round(min / 60)} ч`;
  return `~${min} мин`;
}

export function SimaJobProgress({ job }: SimaJobProgressProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelMutation = useCancelSimaImport();
  const isActive = job.status === 'pending' || job.status === 'processing';
  const idx = simaPhaseIndex(job);
  const percent = simaOverallPercent(job);
  const eta = etaText(job);

  return (
    <div className="space-y-4">
      {/* Статус */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {job.status === 'completed' && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
          {job.status === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
          {job.status === 'canceled' && (
            <Ban className="h-6 w-6 text-gray-400" />
          )}
          {isActive && (
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {job.status === 'pending' && 'Ожидание обработки…'}
              {job.status === 'processing' &&
                `Фаза: ${SIMA_PHASES[Math.min(idx, SIMA_PHASES.length - 1)]?.label ?? '—'}`}
              {job.status === 'completed' && 'Загрузка завершена'}
              {job.status === 'failed' && 'Загрузка не удалась'}
              {job.status === 'canceled' && 'Загрузка отменена'}
            </p>
            <p className="text-sm text-gray-500">{job.fileName}</p>
          </div>
        </div>
        {isActive && !job.cancelRequested && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmCancel(true)}
            loading={cancelMutation.isPending}
          >
            <Ban className="h-4 w-4" />
            Отменить
          </Button>
        )}
        {job.status === 'completed' && (
          <Button variant="outline" size="sm" asChild>
            <a href={ROUTES.PRODUCTS}>
              Открыть каталог
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      {/* Фазы */}
      <div className="grid gap-2 sm:grid-cols-3">
        {SIMA_PHASES.map((p, i) => {
          const [done, total] = simaPhaseCounters(job, p.key);
          const current = i === idx && isActive;
          const passed = i < idx || !isActive;
          return (
            <div
              key={p.key}
              className={`rounded-lg border p-3 transition-colors ${
                current
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-950'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : current ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-300" />
                )}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {p.label}
                </p>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {total > 0 ? `${done} / ${total}` : '—'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Общий прогресс */}
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-500">
            Общий прогресс
            {eta && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                осталось {eta}
              </span>
            )}
          </span>
          <span className="text-gray-700 dark:text-gray-300">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              job.status === 'failed'
                ? 'bg-red-500'
                : job.status === 'canceled'
                  ? 'bg-gray-400'
                  : job.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-primary-500'
            }`}
            style={{ width: `${job.status === 'pending' ? 0 : percent}%` }}
          />
        </div>
      </div>

      {/* Итоги */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Создано</p>
          <p className="text-lg font-semibold text-green-600">{job.createdCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Обновлено</p>
          <p className="text-lg font-semibold text-blue-600">{job.updatedCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs text-gray-500">Ошибки</p>
          <p className="text-lg font-semibold text-red-600">{job.errorCount}</p>
        </div>
      </div>

      {/* Ошибки */}
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
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">
                    Товар/строка
                  </th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">
                    Ошибка
                  </th>
                </tr>
              </thead>
              <tbody>
                {job.errors.map((err, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                      {err.row}
                    </td>
                    <td className="px-3 py-1.5 text-red-600">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        title="Отменить загрузку?"
        description="Успешно созданные/обновлённые товары останутся. Склейка цветов для скачанных страниц сохранится в кэше."
        confirmText="Отменить загрузку"
        variant="danger"
        loading={cancelMutation.isPending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          cancelMutation.mutate(job.id);
        }}
      />
    </div>
  );
}
