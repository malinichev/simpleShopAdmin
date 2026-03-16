import { api } from '@/shared/api';

export interface MarkingCode {
  id: string;
  variantId: string;
  variant?: {
    id: string;
    size: string;
    sku: string;
    productId: string;
    product?: { id: string; name: string };
  };
  code: string;
  gtin: string;
  serial: string;
  status: MarkingCodeStatus;
  orderId: string | null;
  statusChangedAt: string | null;
  createdAt: string;
}

export type MarkingCodeStatus =
  | 'in_stock'
  | 'reserved'
  | 'sold'
  | 'returned'
  | 'written_off';

export interface MarkingQueryParams {
  variantId?: string;
  productId?: string;
  status?: MarkingCodeStatus;
  page?: number;
  limit?: number;
}

export interface MarkingStats {
  total: number;
  in_stock: number;
  reserved: number;
  sold: number;
  returned: number;
  written_off: number;
}

interface PaginatedMarkingCodes {
  data: MarkingCode[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const markingApi = {
  getCodes: async (params: MarkingQueryParams): Promise<PaginatedMarkingCodes> => {
    const { data } = await api.get<PaginatedMarkingCodes>('/marking', { params });
    return data;
  },

  getStats: async (productId?: string, variantId?: string): Promise<MarkingStats> => {
    const { data } = await api.get<MarkingStats>('/marking/stats', {
      params: { productId, variantId },
    });
    return data;
  },

  createCode: async (variantId: string, code: string): Promise<MarkingCode> => {
    const { data } = await api.post<MarkingCode>('/marking', { variantId, code });
    return data;
  },

  bulkCreate: async (
    variantId: string,
    codes: string[],
  ): Promise<{ created: number; duplicates: number }> => {
    const { data } = await api.post<{ created: number; duplicates: number }>(
      '/marking/bulk',
      { variantId, codes },
    );
    return data;
  },

  updateStatus: async (
    id: string,
    status: MarkingCodeStatus,
    orderId?: string,
  ): Promise<MarkingCode> => {
    const { data } = await api.patch<MarkingCode>(`/marking/${id}/status`, {
      status,
      orderId,
    });
    return data;
  },

  bulkUpdateStatus: async (
    ids: string[],
    status: MarkingCodeStatus,
    orderId?: string,
  ): Promise<number> => {
    const { data } = await api.post<number>('/marking/bulk-status', {
      ids,
      status,
      orderId,
    });
    return data;
  },

  deleteCode: async (id: string): Promise<void> => {
    await api.delete(`/marking/${id}`);
  },
};
