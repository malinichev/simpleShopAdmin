import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { OrderStatus } from '@/shared/constants';
import { orderStatuses } from '@/shared/constants';
import { formatRUB } from '@/shared/lib/utils/currency';
import { formatDate } from '@/shared/lib/utils/date';
import type { Order } from '../model/types';

const statusVariantMap: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'secondary',
};

interface OrderCardProps {
  order: Order;
  className?: string;
  onClick?: () => void;
}

export function OrderCard({ order, className, onClick }: OrderCardProps) {
  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : '—';

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {customerName}
          </p>
        </div>
        <Badge variant={statusVariantMap[order.status]}>
          {orderStatuses[order.status].label}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatRUB(order.total)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </span>
      </div>
    </div>
  );
}
