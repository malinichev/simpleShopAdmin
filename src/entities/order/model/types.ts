import type { OrderStatus } from '@/shared/constants';

export interface OrderUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderHistoryEvent {
  _id: string;
  status: OrderStatus;
  comment?: string;
  createdBy?: string;
  createdAt: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: OrderUser;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  promoCode?: string;
  promoDiscount?: number;
  customerNote?: string;
  adminNote?: string;
  history: OrderHistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
}
