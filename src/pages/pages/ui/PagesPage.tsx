import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { DataTable } from '@/shared/ui/data-table';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatDate } from '@/shared/lib/utils/date';
import type { Page } from '@/entities/page';
import {
  usePages,
  useCreatePage,
  useDeletePage,
  PageForm,
  type PageFormData,
} from '@/features/page-management';
import { buildPageEditPath } from '@/shared/config';

export function PagesPage() {
  const { data: pages, isLoading } = usePages();
  const createPage = useCreatePage();
  const deletePage = useDeletePage();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const handleCreate = useCallback(() => setFormOpen(true), []);
  const handleFormClose = useCallback(() => setFormOpen(false), []);

  const handleFormSubmit = useCallback(
    (data: PageFormData) => {
      createPage.mutate(data, { onSuccess: () => setFormOpen(false) });
    },
    [createPage],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteSlug) {
      deletePage.mutate(deleteSlug, { onSuccess: () => setDeleteSlug(null) });
    }
  }, [deleteSlug, deletePage]);

  const columns = useMemo<ColumnDef<Page, unknown>[]>(
    () => [
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            /{row.original.slug}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Название',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.title}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Статус',
        cell: ({ row }) => (
          <Badge variant={row.original.isPublished ? 'success' : 'secondary'}>
            {row.original.isPublished ? 'Опубликовано' : 'Черновик'}
          </Badge>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Обновлено',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              to={buildPageEditPath(row.original.slug)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteSlug(row.original.slug)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Страницы</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление произвольными страницами сайта
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Создать
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pages ?? []}
        total={pages?.length ?? 0}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        manualPagination={false}
        manualSorting={false}
      />

      {/* Create Form Modal */}
      <PageForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isSubmitting={createPage.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteSlug !== null}
        title="Удалить страницу?"
        description="Это действие нельзя отменить. Страница и все её файлы будут безвозвратно удалены."
        confirmText="Удалить"
        variant="danger"
        loading={deletePage.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteSlug(null)}
      />
    </div>
  );
}
