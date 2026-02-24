import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi, type UpdatePagePayload } from '../api/pagesApi';
import { pageKeys } from '../api/queries';

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdatePagePayload }) =>
      pagesApi.updatePage(slug, data),
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      queryClient.setQueryData(pageKeys.detail(updatedPage.slug), updatedPage);
      toast.success('Страница сохранена');
    },
    onError: () => {
      toast.error('Ошибка при сохранении страницы');
    },
  });
}
