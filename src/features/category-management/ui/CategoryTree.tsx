import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Category } from '@/entities/category';

/** Flattened node for dnd-kit */
interface FlatNode {
  category: Category;
  depth: number;
  parentId: string | null;
  index: number; // index among siblings
}

function flattenTree(
  categories: Category[],
  depth: number,
  parentId: string | null,
  expandedIds: Set<string>,
): FlatNode[] {
  const result: FlatNode[] = [];
  categories.forEach((cat, index) => {
    result.push({ category: cat, depth, parentId, index });
    if (cat.children?.length && expandedIds.has(cat._id)) {
      result.push(...flattenTree(cat.children, depth + 1, cat._id, expandedIds));
    }
  });
  return result;
}

function collectAllIds(categories: Category[]): string[] {
  const ids: string[] = [];
  for (const cat of categories) {
    ids.push(cat._id);
    if (cat.children?.length) {
      ids.push(...collectAllIds(cat.children));
    }
  }
  return ids;
}

function isDescendant(category: Category, targetId: string): boolean {
  if (category._id === targetId) return true;
  return category.children?.some((c) => isDescendant(c, targetId)) ?? false;
}

function findCategoryById(categories: Category[], id: string): Category | undefined {
  for (const cat of categories) {
    if (cat._id === id) return cat;
    if (cat.children?.length) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function getSiblings(categories: Category[], parentId: string | null): Category[] {
  if (!parentId) return categories;
  const parent = findCategoryById(categories, parentId);
  return parent?.children ?? [];
}

export interface ReorderItem {
  id: string;
  order: number;
}

export interface MoveItem {
  id: string;
  parentId: string | null;
  order: number;
}

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (category: Category) => void;
  onReorder: (items: ReorderItem[]) => void;
  onMove: (item: MoveItem) => void;
}

export function CategoryTree({
  categories,
  onEdit,
  onAddChild,
  onDelete,
  onReorder,
  onMove,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    return new Set(collectAllIds(categories));
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const flatNodes = useMemo(
    () => flattenTree(categories, 0, null, expandedIds),
    [categories, expandedIds],
  );

  const flatIds = useMemo(() => flatNodes.map((n) => n.category._id), [flatNodes]);

  const activeNode = useMemo(
    () => (activeId ? flatNodes.find((n) => n.category._id === activeId) : null),
    [activeId, flatNodes],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? (event.over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over || active.id === over.id) return;

      const draggedId = active.id as string;
      const targetId = over.id as string;

      const draggedNode = flatNodes.find((n) => n.category._id === draggedId);
      const targetNode = flatNodes.find((n) => n.category._id === targetId);

      if (!draggedNode || !targetNode) return;

      // Prevent dropping onto own descendants
      const draggedCat = findCategoryById(categories, draggedId);
      if (draggedCat && isDescendant(draggedCat, targetId)) return;

      if (draggedNode.parentId === targetNode.parentId) {
        // Same parent — reorder siblings
        const siblings = getSiblings(categories, draggedNode.parentId);
        const oldIndex = siblings.findIndex((s) => s._id === draggedId);
        const newIndex = siblings.findIndex((s) => s._id === targetId);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...siblings];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        onReorder(reordered.map((cat, i) => ({ id: cat._id, order: i })));
      } else {
        // Different parent — move to target's parent at target's position
        const targetSiblings = getSiblings(categories, targetNode.parentId);
        const targetIndex = targetSiblings.findIndex((s) => s._id === targetId);

        onMove({
          id: draggedId,
          parentId: targetNode.parentId,
          order: targetIndex >= 0 ? targetIndex : 0,
        });
      }
    },
    [flatNodes, categories, onReorder, onMove],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {flatNodes.map((node) => (
            <SortableCategoryNode
              key={node.category._id}
              node={node}
              isOver={overId === node.category._id}
              isDragging={activeId === node.category._id}
              isExpanded={expandedIds.has(node.category._id)}
              onToggleExpand={toggleExpand}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="rounded-lg border border-primary-300 bg-white px-3 py-2.5 shadow-lg dark:border-primary-600 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Folder className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {activeNode.category.name}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableCategoryNodeProps {
  node: FlatNode;
  isOver: boolean;
  isDragging: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (category: Category) => void;
}

function SortableCategoryNode({
  node,
  isOver,
  isDragging,
  isExpanded,
  onToggleExpand,
  onEdit,
  onAddChild,
  onDelete,
}: SortableCategoryNodeProps) {
  const { category, depth } = node;
  const hasChildren = (category.children?.length ?? 0) > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 24 + 12}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors',
        isDragging && 'opacity-30',
        isOver && !isDragging && 'bg-primary-50 dark:bg-primary-900/20',
        !isDragging && !isOver && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Expand/collapse */}
      <button
        type="button"
        onClick={() => onToggleExpand(category._id)}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors',
          hasChildren
            ? 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'text-transparent',
        )}
        disabled={!hasChildren}
      >
        {hasChildren &&
          (isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ))}
      </button>

      {/* Icon */}
      {hasChildren && isExpanded ? (
        <FolderOpen className="h-5 w-5 shrink-0 text-primary-500" />
      ) : (
        <Folder className="h-5 w-5 shrink-0 text-gray-400" />
      )}

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">
        {category.name}
      </span>

      {/* Products count */}
      {category.productsCount != null && category.productsCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {category.productsCount}
        </Badge>
      )}

      {/* Status */}
      <Badge variant={category.isActive ? 'success' : 'secondary'} className="text-xs">
        {category.isActive ? 'Активна' : 'Неактивна'}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Редактировать"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onAddChild(category._id)}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Добавить подкатегорию"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          title="Удалить"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
