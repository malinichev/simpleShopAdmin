export interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
}

/** Источник отзыва: local — покупатель магазина, sima-land — поставщик. */
export type ReviewSource = 'local' | 'sima-land';

export interface Review {
  id: string;
  productId: string;
  source: ReviewSource;
  userId?: string;
  user?: ReviewUser;
  orderId?: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  authorName?: string;
  pros?: string;
  cons?: string;
  isVerifiedPurchase?: boolean;
  isAnonymous?: boolean;
  isApproved: boolean;
  isHidden?: boolean;
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
  source?: ReviewSource;
}
