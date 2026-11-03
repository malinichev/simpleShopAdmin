import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/shared/ui/button';
import { productKeys } from '../api/queries';
import { stockSyncApi, type StockSyncRun } from '../api/stockSyncApi';

const POLL_INTERVAL_MS = 3000;

/**
 * Кнопка «Обновить остатки» на странице «Товары»: запускает синк с Сималендом
 * (POST /stock-sync/run), поллингит статус до завершения, по успеху
 * инвалидирует кэш каталога. Если синк уже идёт (cron или другой админ,
 * 409 от сервера) — подхватывает его прогресс.
 */
export function StockSyncButton() {
  const [run, setRun] = useState<StockSyncRun | null>(null);
  const [starting, setStarting] = useState(false);
  const queryClient = useQueryClient();
  const finishedIdsRef = useRef<Set<string>>(new Set());

  const isRunning = run?.status === 'running';
  const progress =
    run && run.totalVariants > 0
      ? ` ${Math.min(run.processedVariants, run.totalVariants)}/${run.totalVariants}`
      : ' …';

  const finishRun = useCallback(
    async (finished: StockSyncRun) => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      if (finished.status === 'succeeded') {
        toast.success(
          `Остатки обновлены: ${finished.updatedCount} изм.` +
            (finished.zeroedCount > 0
              ? `, ${finished.zeroedCount} обнулено`
              : '') +
            (finished.errorCount > 0 ? `, ошибок ${finished.errorCount}` : ''),
        );
      } else {
        toast.error(
          finished.errors?.[0]?.error ??
            `Синк завершился с ошибками (${finished.errorCount})`,
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
        const updated = await stockSyncApi.getRun(run.id);
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
      const started = await stockSyncApi.run();
      setRun(started);
      toast.info('Синк остатков запущен');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        try {
          const [latest] = await stockSyncApi.getLatestRuns(1);
          if (latest?.status === 'running') {
            setRun(latest);
            toast.info('Синк уже выполняется — следим за прогрессом');
            return;
          }
        } catch {
          /* ниже общий тост */
        }
        toast.info('Синк уже выполняется');
      } else {
        toast.error('Не удалось запустить синк остатков');
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleStart}
      disabled={starting || isRunning}
    >
      <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
      {isRunning ? `Синк${progress}` : 'Обновить остатки'}
    </Button>
  );
}
