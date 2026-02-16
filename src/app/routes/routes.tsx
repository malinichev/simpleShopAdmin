import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '@/widgets/layout';

const LoginPage = lazy(() =>
  import('@/pages/login').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const ProductsPage = lazy(() =>
  import('@/pages/products').then((m) => ({ default: m.ProductsPage })),
);
const ProductEditPage = lazy(() =>
  import('@/pages/product-edit').then((m) => ({ default: m.ProductEditPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/categories').then((m) => ({ default: m.CategoriesPage })),
);
const OrdersPage = lazy(() =>
  import('@/pages/orders').then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import('@/pages/order-detail').then((m) => ({ default: m.OrderDetailPage })),
);
const CustomersPage = lazy(() =>
  import('@/pages/customers').then((m) => ({ default: m.CustomersPage })),
);
const ReviewsPage = lazy(() =>
  import('@/pages/reviews').then((m) => ({ default: m.ReviewsPage })),
);
const PromotionsPage = lazy(() =>
  import('@/pages/promotions').then((m) => ({ default: m.PromotionsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/analytics').then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);

const VerifyEmail = lazy(() =>
  import('@/pages/verify-email').then((m) => ({ default: m.VerifyEmail })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.HOME} element={<DashboardPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.PRODUCT_NEW} element={<ProductEditPage />} />
            <Route path={ROUTES.PRODUCT_EDIT} element={<ProductEditPage />} />
            <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
            <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
            <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetailPage />} />
            <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
            <Route path={ROUTES.REVIEWS} element={<ReviewsPage />} />
            <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
