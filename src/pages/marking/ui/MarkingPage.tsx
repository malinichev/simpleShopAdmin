import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { productsApi } from '@/features/product-management';
import {
  MarkingCodesTable,
  ImportCodesDialog,
  useMarkingStats,
} from '@/features/marking-management';

export function MarkingPage() {
  const [productFilter, setProductFilter] = useState('');
  const [variantFilter, setVariantFilter] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products-for-marking'],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const productOptions = useMemo(
    () => [
      { value: '', label: 'Все товары' },
      ...(products?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [products],
  );

  const selectedProduct = products?.data?.find((p) => p.id === productFilter);
  const variantOptions = useMemo(
    () => [
      { value: '', label: 'Все варианты' },
      ...(selectedProduct?.variants ?? []).map((v) => ({
        value: v.id,
        label: `${v.size} (${v.sku})`,
      })),
    ],
    [selectedProduct],
  );

  const { data: stats } = useMarkingStats(
    productFilter || undefined,
    variantFilter || undefined,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Маркировка
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление кодами маркировки (Честный знак)
          </p>
        </div>
        <Button
          onClick={() => setImportOpen(true)}
          disabled={!variantFilter}
        >
          <Plus className="h-4 w-4" />
          Импорт кодов
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {[
            { label: 'Всего', value: stats.total, color: 'text-gray-900 dark:text-white' },
            { label: 'На складе', value: stats.in_stock, color: 'text-green-600' },
            { label: 'Резерв', value: stats.reserved, color: 'text-yellow-600' },
            { label: 'Продано', value: stats.sold, color: 'text-blue-600' },
            { label: 'Возврат', value: stats.returned, color: 'text-orange-600' },
            { label: 'Списано', value: stats.written_off, color: 'text-red-600' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          options={productOptions}
          value={productFilter}
          onChange={(v) => {
            setProductFilter(v);
            setVariantFilter('');
          }}
          placeholder="Товар"
          className="w-[250px]"
        />
        {productFilter && (
          <Select
            options={variantOptions}
            value={variantFilter}
            onChange={setVariantFilter}
            placeholder="Вариант"
            className="w-[200px]"
          />
        )}
      </div>

      {/* Table */}
      <MarkingCodesTable
        productId={productFilter || undefined}
        variantId={variantFilter || undefined}
      />

      {/* Import dialog */}
      {variantFilter && (
        <ImportCodesDialog
          variantId={variantFilter}
          open={importOpen}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}
