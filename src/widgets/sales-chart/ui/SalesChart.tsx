import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui';
import { formatRUB } from '@/shared/lib/utils/currency';
import { useSales, type Granularity } from '@/features/analytics';

type Period = '7d' | '30d' | '12m';

interface PeriodConfig {
  key: Period;
  label: string;
  dateFrom: string;
  granularity: Granularity;
}

function getPeriodConfigs(): PeriodConfig[] {
  const now = new Date();
  return [
    {
      key: '7d',
      label: '7 дней',
      dateFrom: subDays(now, 7).toISOString(),
      granularity: 'day',
    },
    {
      key: '30d',
      label: '30 дней',
      dateFrom: subDays(now, 30).toISOString(),
      granularity: 'day',
    },
    {
      key: '12m',
      label: '12 месяцев',
      dateFrom: subMonths(now, 12).toISOString(),
      granularity: 'month',
    },
  ];
}

function formatDateLabel(dateStr: string, granularity: Granularity): string {
  const date = new Date(dateStr);
  if (granularity === 'month') {
    return format(date, 'LLL', { locale: ru });
  }
  return format(date, 'dd.MM', { locale: ru });
}

export function SalesChart() {
  const [period, setPeriod] = useState<Period>('7d');
  const periodConfigs = useMemo(() => getPeriodConfigs(), []);
  const currentConfig = periodConfigs.find((c) => c.key === period)!;

  const { data: salesData, isLoading, isError, refetch } = useSales({
    dateFrom: currentConfig.dateFrom,
    granularity: currentConfig.granularity,
  });

  const chartData = useMemo(() => {
    if (!salesData) return [];
    return salesData.map((point) => ({
      label: formatDateLabel(point.date, currentConfig.granularity),
      sales: point.revenue,
      orders: point.ordersCount,
    }));
  }, [salesData, currentConfig.granularity]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Продажи</CardTitle>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          {periodConfigs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                period === key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : isError ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Не удалось загрузить данные
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <RefreshCw className="h-4 w-4" />
                Повторить
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="label"
                  className="text-xs"
                  tick={{ fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                        ? `${(value / 1000).toFixed(0)}K`
                        : String(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-gray-800, #1f2937)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number | undefined) => [formatRUB(value ?? 0), 'Продажи']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
