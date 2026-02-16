import { useQuery } from '@tanstack/react-query';
import { userKeys } from '../api/queries';
import { usersApi } from "../api/usersApi";

export function useUsers(id?: string) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => usersApi.getUser(id!),
    enabled: Boolean(id),
  });
}
