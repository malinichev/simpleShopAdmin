import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
import type { Product } from '@/entities/product';
import type { ProductStatus } from '@/shared/constants';
import { productStatuses } from '@/shared/constants';
import { buildProductEditPath } from '@/shared/config';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/shared/ui/data-table';
import { formatRUB } from '@/shared/lib/utils/currency';
import { cn } from '@/shared/lib/utils';

const statusVariantMap: Record<ProductStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  draft: 'secondary',
  archived: 'warning',
  out_of_stock: 'destructive',
};

interface ColumnsOptions {
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function getProductColumns({ onDuplicate, onDelete }: ColumnsOptions): ColumnDef<Product, unknown>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'images',
      header: '',
      cell: ({ row }) => {
        const images = row.original.images;
        const sorted = [...images].sort((a, b) => a.order - b.order);
        const mainImage = sorted[0];
        return (
          <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
            {mainImage ? (
              <img src={mainImage.url} alt={mainImage.alt || ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[8px] text-gray-400">
                img
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Название" />,
      cell: ({ row }) => (
        <Link
          to={buildProductEditPath(row.original._id)}
          className="font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'sku',
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Категория',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.category?.name ?? '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Цена" />,
      cell: ({ row }) => (
        <span className="font-medium">{formatRUB(row.original.price)}</span>
      ),
    },
    {
      id: 'stock',
      header: 'Остаток',
      cell: ({ row }) => {
        const totalStock = row.original.variants.reduce((sum, v) => sum + v.stock, 0);
        return (
          <span
            className={cn(
              'text-sm font-medium',
              totalStock < 5
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-300',
            )}
          >
            {totalStock} шт
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={statusVariantMap[status]}>
            {productStatuses[status].label}
          </Badge>
        );
      },
      enableSorting: false,
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
              <Link to={buildProductEditPath(row.original._id)}>
                <Pencil className="h-4 w-4" />
                Редактировать
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(row.original._id)}>
              <Copy className="h-4 w-4" />
              Дублировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => onDelete(row.original._id)}>
              <Trash2 className="h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];
}
