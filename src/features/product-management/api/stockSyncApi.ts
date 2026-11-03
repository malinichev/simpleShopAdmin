import { api } from '@/shared/api';

/** Прогон синка остатков (таблица stock_sync_runs на сервере). */
export interface StockSyncRun {
  id: string;
  status: 'running' | 'succeeded' | 'failed';
  trigger: 'manual' | 'cli';
  startedAt: string;
  finishedAt: string | null;
  totalVariants: number;
  processedVariants: number;
  updatedCount: number;
  zeroedCount: number;
  errorCount: number;
  errors: Array<{ sku: string; error: string }>;
}

export const stockSyncApi = {
  /** Запустить прогон; сервер сразу отвечает running-строкой (идёт в фоне). */
  run: async (): Promise<StockSyncRun> => {
    const { data } = await api.post<StockSyncRun>('/stock-sync/run');
    return data;
  },

  getRun: async (id: string): Promise<StockSyncRun> => {
    const { data } = await api.get<StockSyncRun>(`/stock-sync/runs/${id}`);
    return data;
  },

  getLatestRuns: async (limit = 10): Promise<StockSyncRun[]> => {
    const { data } = await api.get<StockSyncRun[]>('/stock-sync/runs', {
      params: { limit },
    });
    return data;
  },
};
