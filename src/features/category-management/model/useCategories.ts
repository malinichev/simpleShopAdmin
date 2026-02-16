import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
import { categoryKeys } from '../api/queries';

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoriesApi.getTree(),
  });
}

export function useCategoriesFlat() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesApi.getAll(),
  });
}
