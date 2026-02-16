import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableImage, type ImageItem } from './SortableImage';

interface ImageGalleryProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      onChange(arrayMove(images, oldIndex, newIndex));
    },
    [images, onChange],
  );

  const handleSetMain = useCallback(
    (id: string) => {
      onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
    },
    [images, onChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const filtered = images.filter((img) => img.id !== id);
      // If we deleted the main image, make first one main
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      onChange(filtered);
    },
    [images, onChange],
  );

  const handleAltChange = useCallback(
    (id: string, alt: string) => {
      onChange(images.map((img) => (img.id === id ? { ...img, alt } : img)));
    },
    [images, onChange],
  );

  if (images.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              onSetMain={handleSetMain}
              onDelete={handleDelete}
              onAltChange={handleAltChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
