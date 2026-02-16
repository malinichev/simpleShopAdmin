import { useState } from 'react';
import { Star } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/lib/utils/date';
import type { Review } from '@/entities/review';

interface ReplyModalProps {
  open: boolean;
  onClose: () => void;
  review: Review;
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
}

export function ReplyModal({
  open,
  onClose,
  review,
  onSubmit,
  isSubmitting,
}: ReplyModalProps) {
  const [text, setText] = useState(review.adminReply ?? '');

  const authorName = review.user
    ? `${review.user.firstName} ${review.user.lastName}`
    : `User ${review.userId.slice(-6)}`;

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title="Ответить на отзыв">
      <div className="space-y-4">
        {/* Review preview */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
          {review.title && (
            <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white">
              {review.title}
            </p>
          )}
          <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">{review.text}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">— {authorName}</p>
        </div>

        {/* Reply input */}
        <Textarea
          label="Ваш ответ"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите ответ на отзыв..."
          rows={4}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!text.trim()}
          >
            Опубликовать ответ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
