import { DollarSign, ShoppingCart, Users, CreditCard, RefreshCw } from 'lucide-react';
import { formatRUB } from '@/shared/lib/utils/currency';
import { Skeleton } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { StatCard } from './StatCard';

export interface StatsData {
  salesToday: number;
  salesChange: number;
  ordersToday: number;
  ordersChange: number;
  visitors: number;
  visitorsChange: number;
  avgCheck: number;
  avgCheckChange: number;
}

interface StatsCardsProps {
  data?: StatsData;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

export function StatsCards({ data, isLoading, isError, onRetry }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Не удалось загрузить статистику
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
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Продажи сегодня"
        value={formatRUB(data.salesToday)}
        change={data.salesChange}
        icon={DollarSign}
        iconColor="text-green-600 dark:text-green-400"
        iconBg="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        title="Заказов сегодня"
        value={String(data.ordersToday)}
        change={data.ordersChange}
        icon={ShoppingCart}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="Посетители"
        value={data.visitors.toLocaleString('ru-RU')}
        change={data.visitorsChange}
        icon={Users}
        iconColor="text-purple-600 dark:text-purple-400"
        iconBg="bg-purple-100 dark:bg-purple-900/30"
      />
      <StatCard
        title="Средний чек"
        value={formatRUB(data.avgCheck)}
        change={data.avgCheckChange}
        icon={CreditCard}
        iconColor="text-orange-600 dark:text-orange-400"
        iconBg="bg-orange-100 dark:bg-orange-900/30"
      />
    </div>
  );
}
