import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useDashboard, useTopProducts, useLowStock } from '@/features/analytics';
import { useOrders } from '@/features/order-management';
import { StatsCards, type StatsData } from '@/widgets/stats-cards';
import { SalesChart } from '@/widgets/sales-chart';
import { RecentOrders } from '@/widgets/recent-orders';
import { TopProducts } from '@/widgets/top-products';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui';
import { formatRUB } from '@/shared/lib/utils/currency';
import type { OrderStatus } from '@/shared/constants';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useDashboard();

  const {
    data: topProductsData,
    isLoading: isTopProductsLoading,
    isError: isTopProductsError,
    refetch: refetchTopProducts,
  } = useTopProducts({ limit: 5 });

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useOrders({ limit: 5 });

  const {
    data: lowStockData,
    isLoading: isLowStockLoading,
  } = useLowStock({ threshold: 5, limit: 10 });

  // Map dashboard data to StatsCards format
  const statsData: StatsData | undefined = dashboardData
    ? {
        salesToday: dashboardData.totalRevenue.current,
        salesChange: dashboardData.totalRevenue.changePercent,
        ordersToday: dashboardData.ordersCount.current,
        ordersChange: dashboardData.ordersCount.changePercent,
        visitors: dashboardData.visitorsToday,
        visitorsChange: 0,
        avgCheck: dashboardData.averageOrderValue.current,
        avgCheckChange: dashboardData.averageOrderValue.changePercent,
      }
    : undefined;

  // Map top products to widget format
  const topProducts = topProductsData?.map((p) => ({
    _id: p.productId,
    name: p.name,
    image: undefined as string | undefined,
    sold: p.soldCount,
    revenue: p.revenue,
  }));

  // Map orders to recent orders format
  const recentOrders = ordersData?.data.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    customerName: order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : '—',
    total: order.total,
    status: order.status as OrderStatus,
    createdAt: order.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Добро пожаловать, {user?.firstName ?? 'Администратор'}! Вот обзор вашего магазина.
        </p>
      </div>

      {/* Stats */}
      <StatsCards
        data={statsData}
        isLoading={isDashboardLoading}
        isError={isDashboardError}
        onRetry={() => refetchDashboard()}
      />

      {/* Charts + Top Products */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProducts
            products={topProducts}
            isLoading={isTopProductsLoading}
            isError={isTopProductsError}
            onRetry={() => refetchTopProducts()}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders
        orders={recentOrders}
        isLoading={isOrdersLoading}
        isError={isOrdersError}
        onRetry={() => refetchOrders()}
      />

      {/* Low Stock Alert */}
      {isLowStockLoading ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle>Заканчивается на складе</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : lowStockData && lowStockData.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle>Заканчивается на складе</CardTitle>
              <Badge variant="warning">{lowStockData.length}</Badge>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Все товары →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Товар
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      SKU
                    </th>
                    <th className="pb-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Остаток
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Цена
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {lowStockData.map((product) => (
                    <tr key={product._id}>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{product.sku}</td>
                      <td className="py-3 text-center">
                        <Badge variant={product.stock <= 2 ? 'destructive' : 'warning'}>
                          {product.stock} шт
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-gray-900 dark:text-white">
                        {formatRUB(product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
