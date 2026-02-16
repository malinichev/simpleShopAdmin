import type { Table } from '@tanstack/react-table';
import { Pagination } from '../pagination';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  total,
  pageSizeOptions,
}: DataTablePaginationProps<TData>) {
  return (
    <Pagination
      page={table.getState().pagination.pageIndex + 1}
      pageSize={table.getState().pagination.pageSize}
      total={total}
      onPageChange={(p) => table.setPageIndex(p - 1)}
      onPageSizeChange={(s) => table.setPageSize(s)}
      pageSizeOptions={pageSizeOptions}
      className="mt-4"
    />
  );
}
