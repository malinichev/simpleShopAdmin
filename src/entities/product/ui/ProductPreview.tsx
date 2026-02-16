import { cn } from '@/shared/lib/utils';
import { formatRUB } from '@/shared/lib/utils/currency';
import type { Product } from '../model/types';

interface ProductPreviewProps {
  product: Product;
  className?: string;
  onClick?: () => void;
}

export function ProductPreview({ product, className, onClick }: ProductPreviewProps) {
  const mainImage = product.images.find((img) => img.order === 0) ?? product.images[0];

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <span className="text-[8px] text-gray-400 dark:text-gray-500">N/A</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {product.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product.sku}
        </p>
      </div>

      <span className="flex-shrink-0 text-sm font-medium text-gray-900 dark:text-white">
        {formatRUB(product.price)}
      </span>
    </div>
  );
}
