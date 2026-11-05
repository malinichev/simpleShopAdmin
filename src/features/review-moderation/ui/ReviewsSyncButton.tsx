import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/shared/ui/button';
import { reviewKeys } from '../api/queries';
import { reviewsSyncApi, type ReviewsSyncRun } from '../api/reviewsSyncApi';

const POLL_INTERVAL_MS = 3000;

/**
 * Кнопка «Синхронизировать отзывы» на странице «Отзывы»: ручной импорт
 * отзывов поставщика (POST /reviews-sync/run), поллинг статуса до
 * завершения, по успеху инвалидирует кэш отзывов. Cron для отзывов не
 * используется — только эта кнопка (расход запросов к API под контролем).
 * Если синк уже идёт (409) — подхватывает его прогресс.
 */
export function ReviewsSyncButton() {
  const [run, setRun] = useState<ReviewsSyncRun | null>(null);
  const [starting, setStarting] = useState(false);
  const queryClient = useQueryClient();
  const finishedIdsRef = useRef<Set<string>>(new Set());

  const isRunning = run?.status === 'running';
  const progress =
    run && run.totalProducts > 0
      ? ` ${Math.min(run.processedProducts, run.totalProducts)}/${run.totalProducts}`
      : ' …';

  const finishRun = useCallback(
    async (finished: ReviewsSyncRun) => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      if (finished.status === 'succeeded') {
        toast.success(
          `Отзывы синхронизированы: +${finished.importedCount} новых` +
            (finished.updatedCount > 0
              ? `, ${finished.updatedCount} обновлено`
              : '') +
            (finished.errorCount > 0 ? `, ошибок ${finished.errorCount}` : ''),
        );
      } else {
        toast.error(
          finished.errors?.[0]?.error ??
            `Синк отзывов завершился с ошибками (${finished.errorCount})`,
        );
      }
    },
    [queryClient],
  );

  // Поллинг активного прогона цепочкой setTimeout.
  useEffect(() => {
    if (!run || run.status !== 'running') return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const updated = await reviewsSyncApi.getRun(run.id);
        if (cancelled) return;
        setRun(updated);
        if (
          updated.status !== 'running' &&
          !finishedIdsRef.current.has(updated.id)
        ) {
          finishedIdsRef.current.add(updated.id);
          await finishRun(updated);
        }
      } catch {
        // Сеть моргнула — продолжаем опрашивать со следующего тика.
        if (!cancelled) setRun({ ...run });
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [run, finishRun]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const started = await reviewsSyncApi.run();
      setRun(started);
      toast.info('Синк отзывов запущен');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        try {
          const [latest] = await reviewsSyncApi.getLatestRuns(1);
          if (latest?.status === 'running') {
            setRun(latest);
            toast.info('Синк отзывов уже выполняется — следим за прогрессом');
          } else {
            toast.error('Не удалось запустить синк отзывов');
          }
        } catch {
          toast.error('Не удалось запустить синк отзывов');
        }
      } else {
        toast.error('Не удалось запустить синк отзывов');
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStart}
      disabled={starting || isRunning}
    >
      <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
      {isRunning ? `Синк отзывов${progress}` : 'Синхронизировать с Сималендом'}
    </Button>
  );
}
