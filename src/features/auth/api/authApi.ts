import { api } from '@/shared/api';
import type { LoginRequest, LoginResponse, AuthTokens, User, VerifyEmailRequest} from '@/shared/api/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },
  verifyEmail: async (credentials: VerifyEmailRequest): Promise<void> => {
    await api.post<LoginResponse>('/auth/verify-email', credentials);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
