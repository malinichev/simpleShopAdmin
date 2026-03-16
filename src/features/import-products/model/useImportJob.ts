import { useQuery } from '@tanstack/react-query';
import { importApi } from '../api/importApi';
import { importKeys } from '../api/queries';

export function useImportJob(id: string) {
  return useQuery({
    queryKey: importKeys.job(id),
    queryFn: () => importApi.getJob(id),
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
