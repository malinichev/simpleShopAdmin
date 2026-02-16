import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { formatDate } from '@/shared/lib/utils/date';
import type { Review } from '../model/types';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600',
          )}
        />
      ))}
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
  className?: string;
}

export function ReviewItem({ review, className }: ReviewItemProps) {
  const statusVariant = review.isApproved ? 'success' : 'warning';
  const statusLabel = review.isApproved ? 'Одобрен' : 'На модерации';

  const authorName = review.user
    ? `${review.user.firstName} ${review.user.lastName}`
    : '—';

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4',
        'dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>

          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {review.text}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {authorName}
            </span>
            <span>&middot;</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
