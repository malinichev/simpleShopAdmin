import { cn } from '@/shared/lib/utils';
import { formatRUB } from '@/shared/lib/utils/currency';
import type { OrderItem } from '../model/types';

interface OrderItemRowProps {
  item: OrderItem;
  className?: string;
}

export function OrderItemRow({ item, className }: OrderItemRowProps) {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)}>
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
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
          {item.name}
        </p>
        {(item.size || item.color) && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.size && `Размер: ${item.size}`}
            {item.size && item.color && ' / '}
            {item.color && `Цвет: ${item.color}`}
          </p>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {formatRUB(item.price)} &times; {item.quantity}
        </span>
        <span className="font-medium text-gray-900 dark:text-white">{formatRUB(item.total)}</span>
      </div>
    </div>
  );
}
