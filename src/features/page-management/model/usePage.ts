import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function usePage(slug: string) {
  return useQuery({
    queryKey: pageKeys.detail(slug),
    queryFn: () => pagesApi.getPage(slug),
    enabled: Boolean(slug),
  });
}
