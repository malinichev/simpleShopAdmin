import { api } from '@/shared/api';

/** Прогон синка отзывов (таблица reviews_sync_runs на сервере). */
export interface ReviewsSyncRun {
  id: string;
  status: 'running' | 'succeeded' | 'failed';
  trigger: 'manual' | 'cli';
  startedAt: string;
  finishedAt: string | null;
  totalProducts: number;
  processedProducts: number;
  productsWithComments: number;
  importedCount: number;
  updatedCount: number;
  removedCount: number;
  errorCount: number;
  errors: Array<{ product: string; error: string }>;
}

export const reviewsSyncApi = {
  /** Запустить прогон; сервер сразу отвечает running-строкой (идёт в фоне). */
  run: async (): Promise<ReviewsSyncRun> => {
    const { data } = await api.post<ReviewsSyncRun>('/reviews-sync/run');
    return data;
  },

  getRun: async (id: string): Promise<ReviewsSyncRun> => {
    const { data } = await api.get<ReviewsSyncRun>(`/reviews-sync/runs/${id}`);
    return data;
  },

  getLatestRuns: async (limit = 10): Promise<ReviewsSyncRun[]> => {
    const { data } = await api.get<ReviewsSyncRun[]>('/reviews-sync/runs', {
      params: { limit },
    });
    return data;
  },
};
