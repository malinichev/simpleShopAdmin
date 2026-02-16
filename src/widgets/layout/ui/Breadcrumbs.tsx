import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '@/shared/config';

const breadcrumbLabels: Record<string, string> = {
  products: 'Товары',
  new: 'Новый',
  edit: 'Редактирование',
  categories: 'Категории',
  orders: 'Заказы',
  customers: 'Клиенты',
  reviews: 'Отзывы',
  promotions: 'Промоакции',
  analytics: 'Аналитика',
  settings: 'Настройки',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const segmentsItem = segment
    const label = breadcrumbLabels[segment] ?? segmentsItem ?? segment;
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link
        to={ROUTES.HOME}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map(({ path, label, isLast }) => (
        <span key={path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
          {isLast ? (
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
          ) : (
            <Link
              to={path}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
