import { api } from '@/shared/api';

export interface AuditEntry {
  id: string;
  createdAt: string;
  actorType: 'user' | 'admin' | 'system';
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  requestId?: string | null;
  ip?: string | null;
}

interface AuditListResponse {
  data: AuditEntry[];
  total: number;
  limit: number;
  offset: number;
}

export const auditApi = {
  /** Журнал действий по сущности (заказ) — сервер GET /audit. */
  getOrderAudit: async (orderId: string, limit = 50): Promise<AuditListResponse> => {
    const { data } = await api.get<AuditListResponse>('/audit', {
      params: { entity: 'order', entityId: orderId, limit },
    });
    return data;
  },
};
