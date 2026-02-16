import { RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui';
import { formatRUB } from '@/shared/lib/utils/currency';

interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  sold: number;
  revenue: number;
}

interface TopProductsProps {
  products?: TopProduct[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function TopProductSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function TopProducts({ products, isLoading, isError, onRetry }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ товаров</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <TopProductSkeleton key={i} />
            ))}
          </div>
        ) : isError || !products ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Не удалось загрузить данные
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
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {index + 1}
                </span>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      img
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Продано: {product.sold}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium text-gray-900 dark:text-white">
                  {formatRUB(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
