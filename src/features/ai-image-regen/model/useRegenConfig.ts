import { useQuery } from '@tanstack/react-query';
import { regenApi } from '../api/regenApi';
import { regenKeys } from '../api/queries';

/** Конфиг ИИ-генерации: включена ли, драйвер/модель, базовый промпт + пресеты. */
export function useRegenConfig() {
  return useQuery({
    queryKey: regenKeys.config(),
    queryFn: () => regenApi.getConfig(),
    staleTime: 2 * 60 * 1000,
  });
}
