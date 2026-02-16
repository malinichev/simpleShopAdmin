export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  user?: ReviewUser;
  orderId: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  isApproved: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  isApproved?: boolean;
  rating?: number;
  productId?: string;
}
