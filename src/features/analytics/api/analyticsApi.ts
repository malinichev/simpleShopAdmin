import { api } from '@/shared/api';

// --- Response types ---

export interface PeriodComparison {
  current: number;
  previous: number;
  changePercent: number;
}

export interface DashboardData {
  totalRevenue: PeriodComparison;
  ordersCount: PeriodComparison;
  averageOrderValue: PeriodComparison;
  totalCustomers: number;
  newCustomersToday: number;
  visitorsToday: number;
  conversionRate: number;
  recentOrdersCount: number;
  productsInStock: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
}

export interface VisitorsDataPoint {
  date: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
}

export interface TopProductStat {
  productId: string;
  name: string;
  soldCount: number;
  revenue: number;
}

export interface TopCategoryStat {
  categoryId: string;
  name: string;
  ordersCount: number;
  revenue: number;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  averageOrdersPerCustomer: number;
}

// --- Query params ---

export type Granularity = 'day' | 'week' | 'month';

export interface AnalyticsQueryParams {
  dateFrom?: string;
  dateTo?: string;
  granularity?: Granularity;
}

export interface TopQueryParams {
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  image?: string;
}

export interface LowStockParams {
  threshold?: number;
  limit?: number;
}

// --- API ---

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get<DashboardData>('/analytics/dashboard');
    return data;
  },

  getSales: async (params?: AnalyticsQueryParams): Promise<SalesDataPoint[]> => {
    const { data } = await api.get<SalesDataPoint[]>('/analytics/sales', { params });
    return data;
  },

  getVisitors: async (params?: AnalyticsQueryParams): Promise<VisitorsDataPoint[]> => {
    const { data } = await api.get<VisitorsDataPoint[]>('/analytics/visitors', { params });
    return data;
  },

  getTopProducts: async (params?: TopQueryParams): Promise<TopProductStat[]> => {
    const { data } = await api.get<TopProductStat[]>('/analytics/products', { params });
    return data;
  },

  getTopCategories: async (params?: TopQueryParams): Promise<TopCategoryStat[]> => {
    const { data } = await api.get<TopCategoryStat[]>('/analytics/categories', { params });
    return data;
  },

  getCustomerStats: async (): Promise<CustomerStats> => {
    const { data } = await api.get<CustomerStats>('/analytics/customers');
    return data;
  },

  getLowStock: async (params?: LowStockParams): Promise<LowStockProduct[]> => {
    const { data } = await api.get<LowStockProduct[]>('/analytics/low-stock', { params });
    return data;
  },
};
