export interface CustomerAddress {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
  isDefault: boolean;
}

export type UserRole = 'customer' | 'manager' | 'admin';

export interface Customer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: CustomerAddress[];
  isEmailVerified: boolean;
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}
