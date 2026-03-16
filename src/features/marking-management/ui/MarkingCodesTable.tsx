import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { StatusBadge } from './StatusBadge';
import { useMarkingCodes } from '../model/useMarkingCodes';
import { useBulkUpdateMarkingStatus } from '../model/useUpdateStatus';
import { markingApi, type MarkingCodeStatus, type MarkingQueryParams } from '../api/markingApi';
import { markingKeys } from '../api/queries';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'in_stock', label: 'На складе' },
  { value: 'reserved', label: 'Резерв' },
  { value: 'sold', label: 'Продан' },
  { value: 'returned', label: 'Возврат' },
  { value: 'written_off', label: 'Списан' },
];

const bulkStatusOptions = [
  { value: 'in_stock', label: 'На складе' },
  { value: 'reserved', label: 'Резерв' },
  { value: 'sold', label: 'Продан' },
  { value: 'returned', label: 'Возврат' },
  { value: 'written_off', label: 'Списан' },
];

interface MarkingCodesTableProps {
  productId?: string;
  variantId?: string;
}

export function MarkingCodesTable({ productId, variantId }: MarkingCodesTableProps) {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const queryParams: MarkingQueryParams = {
    productId,
    variantId,
    status: statusFilter ? (statusFilter as MarkingCodeStatus) : undefined,
    page,
    limit: 50,
  };

  const { data, isLoading } = useMarkingCodes(queryParams);
  const bulkUpdate = useBulkUpdateMarkingStatus();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => markingApi.deleteCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markingKeys.all });
      toast.success('Код удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data?.data) return;
    if (selectedIds.size === data.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map((c) => c.id)));
    }
  };

  const handleBulkStatus = (status: string) => {
    if (!status || selectedIds.size === 0) return;
    bulkUpdate.mutate(
      { ids: Array.from(selectedIds), status: status as MarkingCodeStatus },
      {
        onSuccess: () => setSelectedIds(new Set()),
      },
    );
  };

  const codes = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Filters + bulk actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          className="w-[180px]"
        />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedIds.size} выбрано</span>
            <Select
              options={bulkStatusOptions}
              value=""
              onChange={handleBulkStatus}
              placeholder="Сменить статус"
              className="w-[180px]"
            />
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Загрузка...</div>
      ) : codes.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Нет кодов маркировки</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === codes.length && codes.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Код</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">GTIN</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Серийный</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Вариант</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Статус</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr
                  key={code.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(code.id)}
                      onChange={() => toggleSelect(code.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs max-w-[200px] truncate" title={code.code}>
                    {code.code}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{code.gtin || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{code.serial || '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {code.variant?.sku ?? '—'} {code.variant?.size ? `(${code.variant.size})` : ''}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={code.status} />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteMutation.mutate(code.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Страница {meta.page} из {meta.totalPages} (всего: {meta.total})
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
