import { useState, useCallback, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { DataTable } from '@/shared/ui/data-table';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatDate } from '@/shared/lib/utils/date';
import type { Promotion, PromotionType } from '@/entities/promotion';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  PromoForm,
  type PromoFormData,
} from '@/features/promo-management';
import type { CreatePromotionPayload } from '@/features/promo-management/api/promosApi';

// --- Helpers ---

const typeLabels: Record<PromotionType, string> = {
  percentage: 'Процент',
  fixed: 'Фиксированная',
  free_shipping: 'Бесп. доставка',
};

const typeBadgeVariant: Record<PromotionType, 'default' | 'secondary' | 'success'> = {
  percentage: 'default',
  fixed: 'secondary',
  free_shipping: 'success',
};

function formatValue(type: PromotionType, value: number): string {
  if (type === 'percentage') return `${value}%`;
  if (type === 'fixed') return `${value} ₽`;
  return '—';
}

type PromoStatus = 'active' | 'inactive' | 'expired';

function getPromoStatus(promo: Promotion): PromoStatus {
  if (!promo.isActive) return 'inactive';
  const now = new Date();
  if (new Date(promo.endDate) < now) return 'expired';
  return 'active';
}

const statusConfig: Record<PromoStatus, { label: string; variant: 'success' | 'secondary' | 'destructive' }> = {
  active: { label: 'Активен', variant: 'success' },
  inactive: { label: 'Неактивен', variant: 'secondary' },
  expired: { label: 'Истёк', variant: 'destructive' },
};

function toPayload(data: PromoFormData): CreatePromotionPayload {
  return {
    code: data.code.toUpperCase(),
    name: data.name,
    description: data.description || undefined,
    type: data.type,
    value: data.value,
    minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
    maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
    usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : undefined,
    categoryIds: data.categoryIds.length > 0 ? data.categoryIds : undefined,
    productIds: data.productIds.length > 0 ? data.productIds : undefined,
    excludeProductIds: data.excludeProductIds.length > 0 ? data.excludeProductIds : undefined,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    isActive: data.isActive,
  };
}

// --- Page ---

export function PromotionsPage() {
  const { data: promotions, isLoading } = usePromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const [formOpen, setFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setEditPromo(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((promo: Promotion) => {
    setEditPromo(promo);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditPromo(null);
  }, []);

  const handleFormSubmit = useCallback(
    (data: PromoFormData) => {
      const payload = toPayload(data);
      if (editPromo) {
        updatePromotion.mutate(
          { id: editPromo._id, data: payload },
          { onSuccess: () => handleFormClose() },
        );
      } else {
        createPromotion.mutate(payload, {
          onSuccess: () => handleFormClose(),
        });
      }
    },
    [editPromo, createPromotion, updatePromotion, handleFormClose],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      deletePromotion.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  }, [deleteId, deletePromotion]);

  const columns = useMemo<ColumnDef<Promotion, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Код',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Название',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Тип',
        cell: ({ row }) => (
          <Badge variant={typeBadgeVariant[row.original.type]}>
            {typeLabels[row.original.type]}
          </Badge>
        ),
      },
      {
        id: 'value',
        header: 'Значение',
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatValue(row.original.type, row.original.value)}
          </span>
        ),
      },
      {
        id: 'usage',
        header: 'Использовано',
        cell: ({ row }) => {
          const { usedCount, usageLimit } = row.original;
          if (!usageLimit) {
            return <span className="text-sm text-gray-500">{usedCount}</span>;
          }
          const pct = Math.min((usedCount / usageLimit) * 100, 100);
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {usedCount}/{usageLimit}
              </span>
            </div>
          );
        },
      },
      {
        id: 'period',
        header: 'Период',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500">
            {formatDate(row.original.startDate)} — {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Статус',
        cell: ({ row }) => {
          const status = getPromoStatus(row.original);
          const cfg = statusConfig[status];
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleEdit(row.original)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteId(row.original._id)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Промокоды</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление промокодами и скидками
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Создать промокод
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={promotions ?? []}
        total={promotions?.length ?? 0}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        manualPagination={false}
        manualSorting={false}
      />

      {/* Form Modal */}
      <PromoForm
        open={formOpen}
        onClose={handleFormClose}
        promotion={editPromo}
        onSubmit={handleFormSubmit}
        isSubmitting={createPromotion.isPending || updatePromotion.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить промокод?"
        description="Это действие нельзя отменить. Промокод будет безвозвратно удалён."
        confirmText="Удалить"
        variant="danger"
        loading={deletePromotion.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
