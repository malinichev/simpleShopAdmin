import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function usePages() {
  return useQuery({
    queryKey: pageKeys.lists(),
    queryFn: pagesApi.getPages,
  });
}
