import { api, type User} from '@/shared/api';

export const usersApi = {
  getUser: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  }
};
