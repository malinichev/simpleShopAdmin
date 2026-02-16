import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { ROUTES } from '@/shared/config';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <FileQuestion className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mb-1 text-lg font-medium text-gray-700 dark:text-gray-300">
          Страница не найдена
        </p>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          На главную
        </button>
      </div>
    </div>
  );
}
