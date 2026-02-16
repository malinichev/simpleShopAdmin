import { Link } from 'react-router-dom';
import { Eye, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui';
import { buildOrderDetailPath } from '@/shared/config';
import { orderStatuses, type OrderStatus } from '@/shared/constants';
import { formatRUB } from '@/shared/lib/utils/currency';
import { formatDate } from '@/shared/lib/utils/date';

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const statusVariantMap: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'secondary',
};

interface RecentOrdersProps {
  orders?: RecentOrder[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <div className="space-y-1 text-right">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}

export function RecentOrders({ orders, isLoading, isError, onRetry }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Последние заказы</CardTitle>
        <Link
          to="/orders"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Все заказы →
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        ) : isError || !orders ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Не удалось загрузить заказы
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Повторить
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
            {orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariantMap[order.status]}>
                    {orderStatuses[order.status].label}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatRUB(order.total)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Link
                    to={buildOrderDetailPath(order._id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
