import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { LoginRequest, User, VerifyEmailRequest} from '@/shared/api/types';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  verifyEmail: (credentials: VerifyEmailRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: true,

  login: async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_KEY, response.refreshToken);
    set({ user: response.user, isAuthenticated: true });
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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
