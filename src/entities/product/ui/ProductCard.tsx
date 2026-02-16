import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { ProductStatus } from '@/shared/constants';
import { productStatuses } from '@/shared/constants';
import { formatRUB } from '@/shared/lib/utils/currency';
import type { Product } from '../model/types';

const statusVariantMap: Record<
  ProductStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive'
> = {
  active: 'success',
  draft: 'secondary',
  archived: 'warning',
  out_of_stock: 'destructive',
};

interface ProductCardProps {
  product: Product;
  className?: string;
  onClick?: () => void;
}

export function ProductCard({ product, className, onClick }: ProductCardProps) {
  const mainImage = product.images.find((img) => img.order === 0) ?? product.images[0];

  return (
    <div
      className={cn(
        'group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      <div className="mb-3 aspect-square w-full overflow-hidden rounded-md">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <span className="text-sm text-gray-400 dark:text-gray-500">Нет фото</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatRUB(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through dark:text-gray-500">
              {formatRUB(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={statusVariantMap[product.status]}>
            {productStatuses[product.status].label}
          </Badge>
          {product.category && (
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
