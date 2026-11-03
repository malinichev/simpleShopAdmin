import { useQuery } from '@tanstack/react-query';
import { regenApi } from '../api/regenApi';
import { regenKeys } from '../api/queries';

/** Поллинг ВСЕХ job'ов bulk-режима (по одному на товар): 2с, пока хоть один активен. */
export function useRegenJobs(jobIds: string[]) {
  const key = [...jobIds].sort().join(',');
  return useQuery({
    queryKey: [...regenKeys.all, 'jobs-bulk', key],
    queryFn: () => regenApi.getJobs(jobIds),
    enabled: jobIds.length > 0,
    refetchInterval: (query) => {
      const jobs = query.state.data;
      const anyActive = (jobs ?? []).some(
        (j) => j.status === 'pending' || j.status === 'processing',
      );
      return anyActive ? 2000 : false;
    },
  });
}
