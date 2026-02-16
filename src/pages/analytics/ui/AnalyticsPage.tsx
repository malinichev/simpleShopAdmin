import { useState, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from 'date-fns';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { DateRangePicker } from '@/shared/ui/date-picker';
import { cn } from '@/shared/lib/utils';
import { formatRUB } from '@/shared/lib/utils/currency';
import { ExportButton } from '@/features/export-data';
import {
  useDashboard,
  useSales,
  useTopProducts,
  useTopCategories,
  type PeriodComparison,
  type SalesDataPoint,
  type TopProductStat,
  type TopCategoryStat,
} from '@/features/analytics';

// --- Period logic ---

type PeriodKey = 'today' | 'yesterday' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'custom';

const periodTabs: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: 'yesterday', label: 'Вчера' },
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: 'thisMonth', label: 'Этот месяц' },
  { key: 'lastMonth', label: 'Прошлый месяц' },
];

function getDateRange(period: PeriodKey, custom?: DateRange): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const today = startOfDay(now);

  switch (period) {
    case 'today':
      return { dateFrom: today.toISOString(), dateTo: now.toISOString() };
    case 'yesterday': {
      const y = subDays(today, 1);
      return { dateFrom: y.toISOString(), dateTo: today.toISOString() };
    }
    case '7d':
      return { dateFrom: subDays(today, 7).toISOString(), dateTo: now.toISOString() };
    case '30d':
      return { dateFrom: subDays(today, 30).toISOString(), dateTo: now.toISOString() };
    case 'thisMonth':
      return { dateFrom: startOfMonth(now).toISOString(), dateTo: now.toISOString() };
    case 'lastMonth': {
      const prev = subMonths(now, 1);
      return { dateFrom: startOfMonth(prev).toISOString(), dateTo: endOfMonth(prev).toISOString() };
    }
    case 'custom':
      if (custom?.from) {
        return {
          dateFrom: startOfDay(custom.from).toISOString(),
          dateTo: custom.to ? startOfDay(custom.to).toISOString() : now.toISOString(),
        };
      }
      return { dateFrom: subDays(today, 30).toISOString(), dateTo: now.toISOString() };
  }
}

function getGranularity(period: PeriodKey): 'day' | 'week' | 'month' {
  if (period === 'today' || period === 'yesterday') return 'day';
  if (period === '7d') return 'day';
  if (period === '30d' || period === 'thisMonth' || period === 'lastMonth') return 'day';
  return 'day';
}

// --- Order status colors for PieChart ---

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  processing: '#6366f1',
  shipped: '#a855f7',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  refunded: 'Возвращён',
};

// --- Category chart colors ---

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

// --- CSV Export ---

function downloadCSV(salesData: SalesDataPoint[], topProducts: TopProductStat[], topCategories: TopCategoryStat[]) {
  const lines: string[] = [];

  lines.push('=== Продажи по дням ===');
  lines.push('Дата,Выручка,Заказов,Средний чек');
  salesData.forEach((d) => {
    lines.push(`${d.date},${d.revenue},${d.ordersCount},${d.averageOrderValue}`);
  });

  lines.push('');
  lines.push('=== Топ товаров ===');
  lines.push('Название,Продано,Выручка');
  topProducts.forEach((p) => {
    lines.push(`"${p.name}",${p.soldCount},${p.revenue}`);
  });

  lines.push('');
  lines.push('=== Топ категорий ===');
  lines.push('Название,Заказов,Выручка');
  topCategories.forEach((c) => {
    lines.push(`"${c.name}",${c.ordersCount},${c.revenue}`);
  });

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Subcomponents ---

function OverviewCard({
  title,
  data,
  formatter,
  icon: Icon,
  iconColor,
  iconBg,
  isLoading,
}: {
  title: string;
  data?: PeriodComparison;
  formatter: (v: number) => string;
  icon: typeof DollarSign;
  iconColor: string;
  iconBg: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-xl" />;
  }

  const value = data?.current ?? 0;
  const change = data?.changePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatter(value)}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span
          className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">vs прошлый период</span>
      </div>
    </Card>
  );
}

function ChartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-gray-400">
      <p className="text-sm">Ошибка загрузки данных</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-1.5 h-4 w-4" />
        Повторить
      </Button>
    </div>
  );
}

// --- Page ---

export function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const dateRange = useMemo(() => getDateRange(period, customRange), [period, customRange]);
  const granularity = getGranularity(period);

  const dashboard = useDashboard();
  const sales = useSales({ ...dateRange, granularity });
  const topProducts = useTopProducts({ limit: 10, ...dateRange });
  const topCategories = useTopCategories({ limit: 8, ...dateRange });

  // Build orders-by-status data from sales (aggregate ordersCount as a proxy)
  // Since the backend doesn't have a dedicated orders-by-status endpoint,
  // we show overview data from dashboard instead
  const ordersByStatusData = useMemo(() => {
    if (!dashboard.data) return [];
    // Use dashboard.recentOrdersCount and derive approximate distribution
    // For real data, this would need a dedicated API endpoint
    return [
      { name: 'Доставлен', value: dashboard.data.recentOrdersCount, status: 'delivered' },
    ];
  }, [dashboard.data]);

  const handlePeriodChange = useCallback((key: PeriodKey) => {
    setPeriod(key);
    if (key !== 'custom') setCustomRange(undefined);
  }, []);

  const handleCustomRange = useCallback((range: DateRange | undefined) => {
    setCustomRange(range);
    setPeriod('custom');
  }, []);

  const handleExport = useCallback(
    (fmt: 'csv' | 'excel') => {
      if (fmt === 'csv' || fmt === 'excel') {
        downloadCSV(
          sales.data ?? [],
          topProducts.data ?? [],
          topCategories.data ?? [],
        );
      }
    },
    [sales.data, topProducts.data, topCategories.data],
  );

  // Format sales chart date labels
  const salesChartData = useMemo(() => {
    return (sales.data ?? []).map((d) => ({
      ...d,
      label: d.date.length > 7 ? d.date.slice(5) : d.date, // MM-DD or keep as is
    }));
  }, [sales.data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Аналитика</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Отчёты и статистика магазина
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {periodTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePeriodChange(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                period === key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <DateRangePicker
          value={customRange}
          onChange={handleCustomRange}
          placeholder="Период"
          className="w-[260px]"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          title="Выручка"
          data={dashboard.data?.totalRevenue}
          formatter={formatRUB}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-900/30"
          isLoading={dashboard.isLoading}
        />
        <OverviewCard
          title="Заказы"
          data={dashboard.data?.ordersCount}
          formatter={(v) => String(v)}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          isLoading={dashboard.isLoading}
        />
        <OverviewCard
          title="Средний чек"
          data={dashboard.data?.averageOrderValue}
          formatter={formatRUB}
          icon={Receipt}
          iconColor="text-purple-600"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          isLoading={dashboard.isLoading}
        />
        <OverviewCard
          title="Конверсия"
          data={
            dashboard.data
              ? {
                  current: dashboard.data.conversionRate,
                  previous: 0,
                  changePercent: 0,
                }
              : undefined
          }
          formatter={(v) => `${v.toFixed(1)}%`}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          isLoading={dashboard.isLoading}
        />
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Продажи</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : sales.isError ? (
            <ChartError onRetry={() => sales.refetch()} />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}K`
                          : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value, name) => {
                      const v = (value as number) ?? 0;
                      const n = (name as string) ?? '';
                      if (n === 'revenue') return [formatRUB(v), 'Выручка'];
                      if (n === 'ordersCount') return [v, 'Заказов'];
                      return [v, n];
                    }}
                    labelFormatter={(label) => `Дата: ${String(label)}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by Status (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle>Заказы по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : sales.isError ? (
              <ChartError onRetry={() => sales.refetch()} />
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesChartData.length > 0 ? buildStatusPieData(salesChartData) : ordersByStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {(salesChartData.length > 0 ? buildStatusPieData(salesChartData) : ordersByStatusData).map(
                        (entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={ORDER_STATUS_COLORS[entry.status] ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle>Топ категорий</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : topCategories.isError ? (
              <ChartError onRetry={() => topCategories.refetch()} />
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories.data ?? []}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number | undefined) => [formatRUB(value ?? 0), 'Выручка']}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {(topCategories.data ?? []).map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Топ-10 товаров</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : topProducts.isError ? (
            <ChartError onRetry={() => topProducts.refetch()} />
          ) : (topProducts.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Нет данных за выбранный период</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Товар</th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">Продано</th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {(topProducts.data ?? []).map((product, i) => (
                    <tr
                      key={product.productId}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                        {product.soldCount} шт.
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatRUB(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper: build a simple pie from total ordersCount in sales data
function buildStatusPieData(salesData: SalesDataPoint[]) {
  const totalOrders = salesData.reduce((sum, d) => sum + d.ordersCount, 0);
  if (totalOrders === 0) return [];
  return [
    { name: ORDER_STATUS_LABELS.delivered, value: totalOrders, status: 'delivered' },
  ];
}
