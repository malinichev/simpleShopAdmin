import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
}

interface SortableImageProps {
  image: ImageItem;
  onSetMain: (id: string) => void;
  onDelete: (id: string) => void;
  onAltChange: (id: string, alt: string) => void;
}

export function SortableImage({ image, onSetMain, onDelete, onAltChange }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        isDragging && 'z-10 shadow-lg opacity-80',
      )}
    >
      <div className="relative aspect-square">
        <img
          src={image.url}
          alt={image.alt || 'Product image'}
          className="h-full w-full object-cover"
        />

        {/* Drag handle */}
        <button
          type="button"
          className="absolute left-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Actions */}
        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onSetMain(image.id)}
            className={cn(
              'rounded p-1 transition-colors',
              image.isMain
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-black/50 text-white hover:bg-yellow-400 hover:text-yellow-900',
            )}
            title={image.isMain ? 'Главное изображение' : 'Сделать главным'}
          >
            <Star className={cn('h-4 w-4', image.isMain && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            className="rounded bg-black/50 p-1 text-white hover:bg-red-500"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Main badge */}
        {image.isMain && (
          <div className="absolute bottom-1 left-1 rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-medium text-yellow-900">
            Главное
          </div>
        )}
      </div>

      {/* Alt text */}
      <div className="p-2">
        <input
          type="text"
          value={image.alt}
          onChange={(e) => onAltChange(image.id, e.target.value)}
          placeholder="Alt текст..."
          className="w-full rounded border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:text-gray-300"
        />
      </div>
    </div>
  );
}
