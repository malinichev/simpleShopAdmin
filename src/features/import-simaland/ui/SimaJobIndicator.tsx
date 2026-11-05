import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSimaJob, useActiveSimaJob } from '../model/hooks';
import { ROUTES } from '@/shared/config';

/**
 * Индикатор фоновой загрузки с Сималенда для шапки админки: появляется, пока
 * задача выполняется (поллинг 5с), ведёт на страницу прогресса. Монтируется
 * глобально — финальный toast приходит даже если пользователь ушёл со страницы.
 */
export function SimaJobIndicator() {
  const { data: active } = useActiveSimaJob();
  const jobId = active?.id ?? '';
  const { data: job } = useSimaJob(jobId);
  const lastStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!job) return;
    if (
      lastStatus.current === 'processing' &&
      (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled')
    ) {
      if (job.status === 'completed') {
        toast.success('Загрузка с Сималенда завершена', {
          description: `Создано ${job.createdCount}, обновлено ${job.updatedCount}, ошибок ${job.errorCount}`,
        });
      } else if (job.status === 'failed') {
        toast.error('Загрузка с Сималенда не удалась', {
          description: job.errors[0]?.message ?? 'См. детали на странице загрузки',
        });
      }
    }
    lastStatus.current = job.status;
  }, [job]);

  if (!job || (job.status !== 'processing' && job.status !== 'pending')) {
    return null;
  }

  const percent =
    job.totalItems > 0
      ? Math.round((job.processedItems / job.totalItems) * 100)
      : 0;

  return (
    <Link
      to={ROUTES.IMPORT_SIMALAND}
      className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300"
      title="Перейти к прогрессу загрузки"
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Загрузка с Сималенд
      {job.totalItems > 0 && <span className="text-primary-500">{percent}%</span>}
    </Link>
  );
}
