export { analyticsApi } from './api/analyticsApi';
export { analyticsKeys } from './api/queries';
export type {
  DashboardData,
  PeriodComparison,
  SalesDataPoint,
  VisitorsDataPoint,
  TopProductStat,
  TopCategoryStat,
  CustomerStats,
  LowStockProduct,
  AnalyticsQueryParams,
  TopQueryParams,
  LowStockParams,
  Granularity,
} from './api/analyticsApi';
export {
  useDashboard,
  useSales,
  useVisitors,
  useTopProducts,
  useTopCategories,
  useCustomerStats,
  useLowStock,
} from './model/useAnalytics';
