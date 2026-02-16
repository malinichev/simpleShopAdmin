export type UserRole = 'customer' | 'manager' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: object[];
  isEmailVerified: boolean;
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}
