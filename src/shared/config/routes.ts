export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  CUSTOMERS: '/customers',
  REVIEWS: '/reviews',
  PROMOTIONS: '/promotions',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  VERIFY_EMAIL: '/verify-email',
} as const;

export const buildProductEditPath = (id: string): string =>
  ROUTES.PRODUCT_EDIT.replace(':id', id);

export const buildOrderDetailPath = (id: string): string =>
  ROUTES.ORDER_DETAIL.replace(':id', id);
