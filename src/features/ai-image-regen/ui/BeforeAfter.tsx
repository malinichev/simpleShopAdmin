import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Слайдер сравнения «до/после» для ревью ИИ-генерации.
 * Адаптация компонента reveal1 (ziegfiroyt, 21st.dev): убраны заголовок/
 * вертикальный режим/секция-обёртка, пропорция 3:4 под карточку товара,
 * подписи по-русски, стили под тему админки.
 */
interface BeforeAfterProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = 'До',
  afterLabel = 'После',
  className,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX);
    },
    [handleMove],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        if (touch) handleMove(touch.clientX);
      }
    };
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Сравнение до/после"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      className={cn(
        'relative w-full cursor-ew-resize select-none overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
        'aspect-[3/4]',
        className,
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* После — нижний слой целиком */}
      <div className="absolute inset-0">
        <img className="absolute inset-0 size-full object-cover" src={after} alt={afterLabel} />
      </div>

      {/* До — верхний слой, обрезается справа от ползунка */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img className="absolute inset-0 size-full object-cover" src={before} alt={beforeLabel} />
      </div>

      {/* Линия и ручка */}
      <div
        className="absolute bottom-0 top-0 z-10 -translate-x-1/2 bg-white shadow-lg"
        style={{ left: `${position}%`, width: 4 }}
      >
        <div
          className={cn(
            'absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center',
            'rounded-full border-4 border-white bg-primary-600 text-white shadow-xl transition-transform',
            isDragging && 'scale-110',
          )}
        >
          <GripVertical className="size-5" />
        </div>
      </div>

      {/* Подписи */}
      <div className="absolute left-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {beforeLabel}
      </div>
      <div className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {afterLabel}
      </div>
    </div>
  );
}
