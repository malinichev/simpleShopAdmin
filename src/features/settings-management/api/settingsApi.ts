import { api } from '@/shared/api';

export interface NotificationSettings {
  newOrder: boolean;
  statusChange: boolean;
  paymentReceived: boolean;
  newReview: boolean;
  customerRegistration: boolean;
  lowStock: boolean;
  refundRequest: boolean;
}

export interface StoreSettings {
  _id: string;
  storeName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  language: string;
  notifications: NotificationSettings | null;
  notificationEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsPayload = Partial<
  Omit<StoreSettings, '_id' | 'createdAt' | 'updatedAt'>
>;

export interface CreateShippingMethodPayload {
  name: string;
  price?: number;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export type UpdateShippingMethodPayload = Partial<CreateShippingMethodPayload>;

export interface CreatePaymentMethodPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>;

export const settingsApi = {
  // Settings
  getSettings: async (): Promise<StoreSettings> => {
    const { data } = await api.get<StoreSettings>('/settings');
    return data;
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<StoreSettings> => {
    const { data } = await api.patch<StoreSettings>('/settings', payload);
    return data;
  },

  // Shipping Methods
  getShippingMethods: async (): Promise<ShippingMethod[]> => {
    const { data } = await api.get<ShippingMethod[]>('/settings/shipping-methods');
    return data;
  },

  createShippingMethod: async (
    payload: CreateShippingMethodPayload,
  ): Promise<ShippingMethod> => {
    const { data } = await api.post<ShippingMethod>(
      '/settings/shipping-methods',
      payload,
    );
    return data;
  },

  updateShippingMethod: async (
    id: string,
    payload: UpdateShippingMethodPayload,
  ): Promise<ShippingMethod> => {
    const { data } = await api.patch<ShippingMethod>(
      `/settings/shipping-methods/${id}`,
      payload,
    );
    return data;
  },

  deleteShippingMethod: async (id: string): Promise<void> => {
    await api.delete(`/settings/shipping-methods/${id}`);
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const { data } = await api.get<PaymentMethod[]>('/settings/payment-methods');
    return data;
  },

  createPaymentMethod: async (
    payload: CreatePaymentMethodPayload,
  ): Promise<PaymentMethod> => {
    const { data } = await api.post<PaymentMethod>(
      '/settings/payment-methods',
      payload,
    );
    return data;
  },

  updatePaymentMethod: async (
    id: string,
    payload: UpdatePaymentMethodPayload,
  ): Promise<PaymentMethod> => {
    const { data } = await api.patch<PaymentMethod>(
      `/settings/payment-methods/${id}`,
      payload,
    );
    return data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`/settings/payment-methods/${id}`);
  },
};
