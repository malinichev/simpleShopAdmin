import { useState, useCallback } from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import type { Category } from '@/entities/category';
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useMoveCategory,
  CategoryTree,
  CategoryForm,
  type CategoryFormData,
  type ReorderItem,
  type MoveItem,
} from '@/features/category-management';

export function CategoriesPage() {
  const { data: tree = [], isLoading } = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const moveCategory = useMoveCategory();

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | undefined>();

  // Delete confirm state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleCreate = useCallback(() => {
    setEditingCategory(null);
    setParentIdForNew(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setParentIdForNew(undefined);
    setFormOpen(true);
  }, []);

  const handleAddChild = useCallback((parentId: string) => {
    setEditingCategory(null);
    setParentIdForNew(parentId);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: CategoryFormData) => {
      if (editingCategory) {
        updateCategory.mutate(
          { id: editingCategory._id, data },
          { onSuccess: () => setFormOpen(false) },
        );
      } else {
        createCategory.mutate(data, {
          onSuccess: () => setFormOpen(false),
        });
      }
    },
    [editingCategory, createCategory, updateCategory],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deletingCategory) {
      deleteCategory.mutate(deletingCategory._id, {
        onSuccess: () => setDeletingCategory(null),
      });
    }
  }, [deletingCategory, deleteCategory]);

  const handleReorder = useCallback(
    (items: ReorderItem[]) => {
      reorderCategories.mutate(items);
    },
    [reorderCategories],
  );

  const handleMove = useCallback(
    (item: MoveItem) => {
      moveCategory.mutate(item);
    },
    [moveCategory],
  );

  const hasProducts = (deletingCategory?.productsCount ?? 0) > 0;
  const hasChildren = (deletingCategory?.children?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Категории</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление категориями товаров
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-12 w-12" />}
          title="Нет категорий"
          description="Создайте первую категорию для организации товаров"
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Добавить категорию
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <CategoryTree
            categories={tree}
            onEdit={handleEdit}
            onAddChild={handleAddChild}
            onDelete={setDeletingCategory}
            onReorder={handleReorder}
            onMove={handleMove}
          />
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editingCategory}
        parentId={parentIdForNew}
        allCategories={tree}
        onSubmit={handleFormSubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deletingCategory !== null}
        title="Удалить категорию?"
        description={
          hasChildren
            ? 'Эта категория содержит подкатегории. Сначала удалите или переместите их.'
            : hasProducts
              ? `Эта категория содержит ${deletingCategory?.productsCount} товаров. Они останутся без категории.`
              : 'Это действие нельзя отменить.'
        }
        confirmText="Удалить"
        variant="danger"
        loading={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
        confirmDisabled={hasChildren}
      />
    </div>
  );
}
