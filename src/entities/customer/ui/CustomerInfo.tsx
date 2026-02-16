import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/lib/utils/date';
import type { Customer } from '../model/types';

interface CustomerInfoProps {
  customer: Customer;
  className?: string;
}

export function CustomerInfo({ customer, className }: CustomerInfoProps) {
  const initials = customer.firstName.charAt(0).toUpperCase();
  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          'bg-emerald-100 text-emerald-700 text-lg font-semibold',
          'dark:bg-emerald-900/30 dark:text-emerald-400',
        )}
      >
        {initials}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {fullName}
        </p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          {customer.email}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span>{customer.phone || 'Не указан'}</span>
          <span>&middot;</span>
          <span>{formatDate(customer.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
