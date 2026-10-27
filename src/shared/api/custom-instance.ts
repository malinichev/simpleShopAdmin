import type { AxiosRequestConfig, Method } from 'axios';
import { api } from './instance';

type MutatorInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  signal?: AbortSignal;
};

/**
 * Мутатор for orval 8 (fetch-style контракт): (url, init) → { data, status, headers }.
 * Все сгенерированные запросы идут через общий axios-инстанс `api` — с baseURL
 * (уже включает /api), withCredentials и interceptors (Bearer-токен из store +
 * авто-refresh на 401).
 */
export const customInstance = async <T>(
  url: string,
  init: MutatorInit = {},
): Promise<T> => {
  const response = await api({
    url,
    method: (init.method ?? 'GET') as Method,
    headers: init.headers,
    data: init.body,
    signal: init.signal,
  } satisfies AxiosRequestConfig);

  return {
    data: response.data,
    status: response.status,
    headers: new Headers(
      Object.entries({ ...response.headers }).map(
        ([k, v]): [string, string] => [k, String(v)],
      ),
    ),
  } as T;
};
