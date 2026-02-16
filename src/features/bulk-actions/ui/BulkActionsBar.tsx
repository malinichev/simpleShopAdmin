import { useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/shared/ui/dropdown-menu';
import type { ProductStatus } from '@/shared/constants';
import { productStatuses } from '@/shared/constants';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onStatusChange: (status: ProductStatus) => void;
  deleteLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onStatusChange,
  deleteLoading,
}: BulkActionsBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20">
        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
          Выбрано: {selectedCount}
        </span>

        <div className="mx-2 h-5 w-px bg-primary-200 dark:bg-primary-700" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Изменить статус
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Статус</DropdownMenuLabel>
            {(Object.entries(productStatuses) as Array<[ProductStatus, { label: string }]>).map(
              ([key, { label }]) => (
                <DropdownMenuItem key={key} onSelect={() => onStatusChange(key)}>
                  {label}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Удалить
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить выбранные товары?"
        description={`Вы действительно хотите удалить ${selectedCount} товар(ов)? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        loading={deleteLoading}
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
