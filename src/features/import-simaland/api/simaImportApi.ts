import { api } from '@/shared/api';

export interface SimaPreviewResult {
  fileKey: string;
  fileName: string;
  totalRows: number;
  parsedRows: number;
  skippedNoSid: number;
  womenRows: number;
  existingSkus: number;
  categories: Array<{ category: string; count: number }>;
  unmapped: number;
  linkedByCache: number;
  sample: Array<{ sid: number; title: string; color: string }>;
}

export type SimaJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

export type SimaJobPhase = 'scrape' | 'images' | 'products' | 'done';

export interface SimaJob {
  id: string;
  status: SimaJobStatus;
  phase: SimaJobPhase;
  fileName: string;
  fileKey: string;
  totalItems: number;
  processedItems: number;
  scrapeTotal: number;
  scrapeDone: number;
  imagesTotal: number;
  imagesDone: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errors: Array<{ row: string; message: string }>;
  cancelRequested: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedSimaJobs {
  data: SimaJob[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const simaImportApi = {
  preview: async (file: File): Promise<SimaPreviewResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<SimaPreviewResult>(
      '/sima-import/preview',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  start: async (params: {
    fileKey: string;
    onlyWomen?: boolean;
  }): Promise<SimaJob> => {
    const { data } = await api.post<SimaJob>('/sima-import/start', params);
    return data;
  },

  getJobs: async (page = 1, limit = 20): Promise<PaginatedSimaJobs> => {
    const { data } = await api.get<PaginatedSimaJobs>('/sima-import/jobs', {
      params: { page, limit },
    });
    return data;
  },

  getJob: async (id: string): Promise<SimaJob> => {
    const { data } = await api.get<SimaJob>(`/sima-import/jobs/${id}`);
    return data;
  },

  getActiveJob: async (): Promise<SimaJob | null> => {
    const { data } = await api.get<SimaJob | null>('/sima-import/jobs/active');
    return data;
  },

  cancel: async (id: string): Promise<SimaJob> => {
    const { data } = await api.post<SimaJob>(`/sima-import/jobs/${id}/cancel`);
    return data;
  },
};
