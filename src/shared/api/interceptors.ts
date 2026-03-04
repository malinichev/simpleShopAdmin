import type { InternalAxiosRequestConfig } from 'axios';
import { api } from './instance';
import type { AuthTokens } from './types';

function isAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.aud === 'admin-panel';
  } catch {
    return false;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Token holder — set by authStore, avoids circular dependency
let _getAccessToken: (() => string | null) | null = null;
let _setAccessToken: ((token: string | null) => void) | null = null;
let _clearAuth: (() => void) | null = null;

export function bindAuthStore(fns: {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}): void {
  _getAccessToken = fns.getAccessToken;
  _setAccessToken = fns.setAccessToken;
  _clearAuth = fns.clearAuth;
}

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

export function setupInterceptors(): void {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = _getAccessToken?.();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

      if (error.response?.status !== 401 || originalRequest._retry || isRefreshRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token is sent automatically via httpOnly cookie (withCredentials: true)
        const { data } = await api.post<AuthTokens>('/auth/refresh');

        const { accessToken } = data;

        // Reject tokens without admin-panel audience (e.g. from storefront session)
        if (!isAdminToken(accessToken)) {
          throw new Error('Invalid token audience');
        }

        _setAccessToken?.(accessToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _clearAuth?.();

        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
