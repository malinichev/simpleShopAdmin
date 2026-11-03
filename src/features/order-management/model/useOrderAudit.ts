import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';

export const auditKeys = {
  orderAudit: (orderId: string) => ['audit', 'order', orderId] as const,
};

export function useOrderAudit(orderId: string) {
  return useQuery({
    queryKey: auditKeys.orderAudit(orderId),
    queryFn: () => auditApi.getOrderAudit(orderId),
    enabled: Boolean(orderId),
  });
}
