import { Navigate } from 'react-router-dom';
import { LoginForm, useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared/config';

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500 text-xl font-bold text-white shadow-lg shadow-primary-500/30">
              SS
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SportShop Admin
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Войдите в панель управления
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          SportShop &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
