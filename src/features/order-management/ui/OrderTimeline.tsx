import { cn } from '@/shared/lib/utils';
import { formatDateTime } from '@/shared/lib/utils/date';
import type { OrderHistoryEvent } from '@/entities/order';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderTimelineProps {
  events: OrderHistoryEvent[];
  className?: string;
}

export function OrderTimeline({ events, className }: OrderTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className={cn('relative', className)}>
      {sorted.map((event, index) => {
        const isLast = index === sorted.length - 1;

        return (
          <div key={event._id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[9px] top-5 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Dot */}
            <div className="relative z-10 mt-1 h-[18px] w-[18px] flex-shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-primary-500 bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-primary-500" />
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={event.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(event.createdAt)}
                </span>
              </div>

              {event.comment && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {event.comment}
                </p>
              )}

              {event.createdBy && (
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {event.createdBy}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
