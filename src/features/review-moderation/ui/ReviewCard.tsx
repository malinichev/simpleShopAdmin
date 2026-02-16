import { Star, Check, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { formatDate, formatDateTime } from '@/shared/lib/utils/date';
import type { Review } from '@/entities/review';

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700',
          )}
        />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onApprove: (id: string) => void;
  onReply: (review: Review) => void;
  onDelete: (id: string) => void;
}

export function ReviewCard({ review, onApprove, onReply, onDelete }: ReviewCardProps) {
  const authorName = review.user
    ? `${review.user.firstName} ${review.user.lastName}`
    : `User ${review.userId.slice(-6)}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <Badge variant={review.isApproved ? 'success' : 'warning'}>
            {review.isApproved ? 'Одобрен' : 'На модерации'}
          </Badge>
        </div>
        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {review.title}
        </p>
      )}

      {/* Text */}
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
        {review.text}
      </p>

      {/* Images */}
      {review.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.map((url, i) => (
            <div key={i} className="h-16 w-16 overflow-hidden rounded-lg">
              <img
                src={url}
                alt={`Фото ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Author */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {authorName}
      </p>

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Ответ администратора
            {review.adminReplyAt && (
              <span className="ml-1 font-normal">
                {formatDateTime(review.adminReplyAt)}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {review.adminReply}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-3 dark:border-gray-700">
        {!review.isApproved && (
          <button
            type="button"
            onClick={() => onApprove(review._id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <Check className="h-3.5 w-3.5" />
            Одобрить
          </button>
        )}
        <button
          type="button"
          onClick={() => onReply(review)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ответить
        </button>
        <button
          type="button"
          onClick={() => onDelete(review._id)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить
        </button>
      </div>
    </div>
  );
}
