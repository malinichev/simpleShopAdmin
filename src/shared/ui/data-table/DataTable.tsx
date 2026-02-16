import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '../skeleton';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  total?: number;
  pagination?: PaginationState;
  sorting?: SortingState;
  rowSelection?: RowSelectionState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string;
  isLoading?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  total = 0,
  pagination,
  sorting,
  rowSelection,
  onPaginationChange,
  onSortingChange,
  onRowSelectionChange,
  getRowId,
  isLoading,
  manualPagination = true,
  manualSorting = true,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination,
    manualSorting,
    getRowId,
    enableRowSelection: rowSelection !== undefined,
    state: {
      pagination,
      sorting,
      ...(rowSelection !== undefined && { rowSelection }),
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    pageCount: pagination ? Math.ceil(total / pagination.pageSize) : -1,
  });

  return (
    <div className={className}>
      <div className="overflow-y-hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {isLoading ? (
              Array.from({ length: pagination?.pageSize ?? 10 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows?.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    row.getIsSelected() && 'bg-primary-50/50 dark:bg-primary-900/10',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <DataTablePagination table={table} total={total} />
      )}
    </div>
  );
}
