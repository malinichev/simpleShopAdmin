import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ROUTES } from '@/shared/config';
import { productStatuses, type ProductStatus } from '@/shared/constants';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import { productsApi, productKeys } from '@/features/product-management';
import { useCategoriesFlat } from '@/features/category-management';
import { BulkActionsBar } from '@/features/bulk-actions';
import { ExportButton } from '@/features/export-data';
import { ProductsTable } from '@/widgets/products-table';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  ...Object.entries(productStatuses).map(([value, { label }]) => ({ value, label })),
];

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategoriesFlat();

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Все категории' },
      ...categories.map((c) => ({ value: c._id, label: c.name })),
    ],
    [categories],
  );

  const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => productsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      setRowSelection({});
      toast.success('Товары удалены');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ProductStatus }) =>
      productsApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      setRowSelection({});
      toast.success('Статус обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  const handleExport = (format: 'csv' | 'excel') => {
    toast.info(`Экспорт в ${format.toUpperCase()} начат`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Товары</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление каталогом товаров
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.PRODUCT_NEW}>
            <Plus className="h-4 w-4" />
            Добавить товар
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, SKU..."
            className="pl-9"
          />
        </div>
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="Категория"
          className="w-[180px]"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Статус"
          className="w-[160px]"
        />
        <ExportButton onExport={handleExport} />
      </div>

       {/*Bulk actions */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onDelete={() => bulkDeleteMutation.mutate(selectedIds)}
        onStatusChange={(status) => bulkStatusMutation.mutate({ ids: selectedIds, status })}
        deleteLoading={bulkDeleteMutation.isPending}
      />

       {/*Table */}
      <ProductsTable
        search={debouncedSearch}
        categoryId={categoryFilter}
        status={statusFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
}
