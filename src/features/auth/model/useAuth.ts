import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { ROUTES } from '@/shared/config';
import type { LoginRequest } from '@/shared/api/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await storeLogin(credentials);
      navigate(ROUTES.HOME);
    },
    [storeLogin, navigate],
  );

  const logout = useCallback(async () => {
    await storeLogout();
    navigate(ROUTES.LOGIN);
  }, [storeLogout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
