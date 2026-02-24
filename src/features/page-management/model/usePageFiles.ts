import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function usePageFiles() {
  return useQuery({
    queryKey: pageKeys.files(),
    queryFn: pagesApi.getPageFiles,
  });
}
