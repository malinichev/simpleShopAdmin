import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  simaImportApi,
  type SimaJob,
  type SimaPreviewResult,
} from '../api/simaImportApi';

export const simaImportKeys = {
  all: ['sima-import'] as const,
  jobs: () => [...simaImportKeys.all, 'jobs'] as const,
  job: (id: string) => [...simaImportKeys.all, 'job', id] as const,
  active: () => [...simaImportKeys.all, 'active'] as const,
};

/** Превью выгрузки (без скрейпа, быстро). */
export function useSimaPreview() {
  return useMutation<SimaPreviewResult, Error, File>({
    mutationFn: (file: File) => simaImportApi.preview(file),
    onError: (error) =>
      toast.error('Не удалось разобрать файл', {
        description: error.message,
      }),
  });
}

export function useStartSimaImport() {
  const queryClient = useQueryClient();
  return useMutation<SimaJob, Error, { fileKey: string; onlyWomen?: boolean }>({
    mutationFn: simaImportApi.start,
    onSuccess: (job) => {
      toast.success('Загрузка запущена', {
        description: 'Склейка цветов и зеркалирование картинок идут в фоне',
      });
      void queryClient.invalidateQueries({ queryKey: simaImportKeys.jobs() });
      void queryClient.invalidateQueries({ queryKey: simaImportKeys.active() });
    },
    onError: (error) =>
      toast.error('Не удалось запустить загрузку', { description: error.message }),
  });
}

/**
 * Поллинг джобы: 2с пока выполняется. При переходе в завершённое состояние —
 * итоговый toast (виден даже если пользователь ушёл со страницы — хук смонтирован
 * и на странице, и в индикаторе хедера).
 */
export function useSimaJob(id: string, notifyOnFinish = false) {
  return useQuery<SimaJob, Error>({
    queryKey: simaImportKeys.job(id),
    queryFn: () => simaImportApi.getJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') return 2000;
      return false;
    },
  });
}

export function useSimaJobs(page = 1) {
  return useQuery({
    queryKey: [...simaImportKeys.jobs(), page],
    queryFn: () => simaImportApi.getJobs(page),
  });
}

/** Активная джоба для индикатора в шапке: редкий поллинг, только пока идёт. */
export function useActiveSimaJob() {
  return useQuery<SimaJob | null, Error>({
    queryKey: simaImportKeys.active(),
    queryFn: simaImportApi.getActiveJob,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === 'pending' || status === 'processing') return 5000;
      return false;
    },
  });
}

export function useCancelSimaImport() {
  const queryClient = useQueryClient();
  return useMutation<SimaJob, Error, string>({
    mutationFn: simaImportApi.cancel,
    onSuccess: (job) => {
      toast.info('Отмена запрошена', {
        description: 'Задача остановится после текущего блока работ',
      });
      void queryClient.invalidateQueries({ queryKey: simaImportKeys.job(job.id) });
    },
    onError: (error) =>
      toast.error('Не удалось отменить', { description: error.message }),
  });
}
