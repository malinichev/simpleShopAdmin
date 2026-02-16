import { api } from '@/shared/api';
import type { Customer, CustomerQueryParams } from '@/entities/customer';
import type { Order } from '@/entities/order';

interface PaginatedCustomers {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PaginatedOrders {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customersApi = {
  getCustomers: async (params: CustomerQueryParams): Promise<PaginatedCustomers> => {
    const { data } = await api.get<PaginatedCustomers>('/users', { params });
    return data;
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/users/${id}`);
    return data;
  },

  getCustomerOrders: async (
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedOrders> => {
    const { data } = await api.get<PaginatedOrders>(`/users/${id}/orders`, { params });
    return data;
  },
};
