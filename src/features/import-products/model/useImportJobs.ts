import { useQuery } from '@tanstack/react-query';
import { importApi } from '../api/importApi';
import { importKeys } from '../api/queries';

export function useImportJobs(page = 1) {
  return useQuery({
    queryKey: importKeys.jobsList(page),
    queryFn: () => importApi.getJobs(page),
  });
}
