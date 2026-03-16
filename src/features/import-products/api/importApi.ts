import { api } from '@/shared/api';

export interface ImportPreviewResult {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileKey: string;
}

export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  fileKey: string;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  columnMapping: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedImportJobs {
  data: ImportJob[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const importApi = {
  preview: async (file: File): Promise<ImportPreviewResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ImportPreviewResult>('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  start: async (params: {
    fileKey: string;
    mapping: Record<string, string>;
    defaultStatus?: string;
    skipDuplicates?: boolean;
  }): Promise<ImportJob> => {
    const { data } = await api.post<ImportJob>('/import/start', params);
    return data;
  },

  getJobs: async (page = 1, limit = 20): Promise<PaginatedImportJobs> => {
    const { data } = await api.get<PaginatedImportJobs>('/import/jobs', {
      params: { page, limit },
    });
    return data;
  },

  getJob: async (id: string): Promise<ImportJob> => {
    const { data } = await api.get<ImportJob>(`/import/jobs/${id}`);
    return data;
  },

  downloadTemplate: async () => {
    const { data } = await api.get('/import/template', { responseType: 'blob' });
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
