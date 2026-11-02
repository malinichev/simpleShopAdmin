import { useQuery } from '@tanstack/react-query';
import { regenApi } from '../api/regenApi';
import { regenKeys } from '../api/queries';

/** Поллинг job'а регенерации: 2с, пока pending/processing (как useImportJob). */
export function useRegenJob(id: string | null) {
  return useQuery({
    queryKey: regenKeys.job(id ?? ''),
    queryFn: () => regenApi.getJob(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') {
        return 2000;
      }
      return false;
    },
  });
}
