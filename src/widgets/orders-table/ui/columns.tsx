import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, RefreshCw } from 'lucide-react';
import type { Order } from '@/entities/order';
import type { PaymentStatus } from '@/entities/order';
import { buildOrderDetailPath } from '@/shared/config';
import { paymentStatuses } from '@/shared/constants';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';
import { formatRUB } from '@/shared/lib/utils/currency';
import { formatDateTime } from '@/shared/lib/utils/date';
import { OrderStatusBadge } from '@/features/order-management';

const paymentVariantMap: Record<PaymentStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'secondary',
};

interface ColumnsOptions {
  onChangeStatus: (order: Order) => void;
}

export function getOrderColumns({ onChangeStatus }: ColumnsOptions): ColumnDef<Order, unknown>[] {
  return [
    {
      accessorKey: 'orderNumber',
      header: 'Номер',
      cell: ({ row }) => (
        <Link
          to={buildOrderDetailPath(row.original._id)}
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      id: 'customer',
      header: 'Клиент',
      cell: ({ row }) => {
        const { user, userId } = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}`: userId}
            </p>
            {user?.email && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'items',
      header: 'Товары',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.items.length} шт
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'total',
      header: 'Сумма',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatRUB(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      enableSorting: false,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Оплата',
      cell: ({ row }) => {
        const ps = row.original.paymentStatus;
        return (
          <Badge variant={paymentVariantMap[ps]}>
            {paymentStatuses[ps]?.label ?? paymentStatuses.pending.label}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={buildOrderDetailPath(row.original._id)}>
                <Eye className="h-4 w-4" />
                Просмотр
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onChangeStatus(row.original)}>
              <RefreshCw className="h-4 w-4" />
              Изменить статус
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];
}
