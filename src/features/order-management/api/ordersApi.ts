import { api } from '@/shared/api';
import type { Order, OrderQueryParams } from '@/entities/order';
import type { OrderStatus } from '@/shared/constants';

interface PaginatedOrders {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ordersApi = {
  getOrders: async (params: OrderQueryParams): Promise<PaginatedOrders> => {
    const { data } = await api.get<PaginatedOrders>('/orders', { params });
    return data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (
    id: string,
    status: OrderStatus,
    comment?: string,
  ): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, {
      status,
      comment: comment || undefined,
    });
    return data;
  },

  updateAdminNote: async (id: string, adminNote: string): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}`, { adminNote });
    return data;
  },
};
