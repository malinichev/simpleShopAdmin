import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import type { PaginationState, SortingState, RowSelectionState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '@/shared/ui/data-table';
import { EmptyState } from '@/shared/ui/empty-state';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { toast } from 'sonner';
import {
  useProducts,
  useDeleteProduct,
  productsApi,
  productKeys,
} from '@/features/product-management';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {Product, ProductQueryParams } from '@/entities/product';
import { getProductColumns } from './columns';

interface ProductsTableProps {
  search?: string;
  categoryId?: string;
  status?: string;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

export function ProductsTable({
  search,
  categoryId,
  status,
  rowSelection,
  onRowSelectionChange,
}: ProductsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const sortMap: Record<string, { asc?: ProductQueryParams['sort']; desc?: ProductQueryParams['sort'] }> = {
    price: { asc: 'price_asc', desc: 'price_desc' },
    name: { asc: 'newest', desc: 'newest' },
  };
  const sortCol = sorting[0];
  const sort = sortCol
    ? sortMap[sortCol.id]?.[sortCol.desc ? 'desc' : 'asc']
    : undefined;

  const params: ProductQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
    category: categoryId || undefined,
    status: (status as ProductQueryParams['status']) || undefined,
    sort,
  };

  const { data, isLoading } = useProducts(params);
  const deleteProduct = useDeleteProduct();

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => productsApi.duplicateProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Товар дублирован');
    },
    onError: () => {
      toast.error('Ошибка при дублировании');
    },
  });

  const columns = useMemo(
    () =>
      getProductColumns({
        onDuplicate: (id) => duplicateMutation.mutate(id),
        onDelete: (id) => setDeleteId(id),
      }),
    [duplicateMutation],
  );

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  if (!isLoading && products.length === 0 && !search && !categoryId && !status) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Нет товаров"
        description="Добавьте первый товар, чтобы начать продавать"
      />
    );
  }

  return (
    <>
      <DataTable<Product>
        columns={columns}
        data={products}
        total={total}
        pagination={pagination}
        sorting={sorting}
        rowSelection={rowSelection}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row._id}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить товар?"
        description="Это действие нельзя отменить. Товар будет безвозвратно удалён."
        confirmText="Удалить"
        variant="danger"
        loading={deleteProduct.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteProduct.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
