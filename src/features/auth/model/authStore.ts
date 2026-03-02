import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { LoginRequest, User, VerifyEmailRequest} from '@/shared/api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  verifyEmail: (credentials: VerifyEmailRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: true,

  login: async (credentials) => {
    const response = await authApi.login({ ...credentials, client: 'admin-panel' });
    set({ accessToken: response.accessToken, user: response.user, isAuthenticated: true });
  },

  verifyEmail: async (credentials) => {
    await authApi.verifyEmail(credentials);
    set({  isEmailVerified: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      set({ accessToken: null, user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => {
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
