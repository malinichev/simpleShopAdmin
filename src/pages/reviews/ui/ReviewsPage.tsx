import { useState, useCallback } from 'react';
import { MessageSquareOff } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { Pagination } from '@/shared/ui/pagination';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { DateRangePicker } from '@/shared/ui/date-picker';
import type { Review, ReviewQueryParams } from '@/entities/review';
import {
  useReviews,
  useApproveReview,
  useReplyToReview,
  useDeleteReview,
  ReviewCard,
  ReplyModal,
} from '@/features/review-moderation';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобренные' },
];

const ratingOptions = [
  { value: '', label: 'Все оценки' },
  { value: '5', label: '5 звёзд' },
  { value: '4', label: '4 звезды' },
  { value: '3', label: '3 звезды' },
  { value: '2', label: '2 звезды' },
  { value: '1', label: '1 звезда' },
];

export function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const approveReview = useApproveReview();
  const replyToReview = useReplyToReview();
  const deleteReview = useDeleteReview();

  const params: ReviewQueryParams = {
    page,
    limit: 12,
    isApproved: statusFilter === 'approved' ? true : statusFilter === 'pending' ? false : undefined,
    rating: ratingFilter ? Number(ratingFilter) : undefined,
  };

  const { data, isLoading } = useReviews(params);

  const reviews = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handleApprove = useCallback(
    (id: string) => {
      approveReview.mutate(id);
    },
    [approveReview],
  );

  const handleReply = useCallback((review: Review) => {
    setReplyReview(review);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      deleteReview.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  }, [deleteId, deleteReview]);

  const hasFilters = statusFilter || ratingFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Отзывы</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Модерация отзывов клиентов
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder="Статус"
          className="w-[170px]"
        />
        <Select
          options={ratingOptions}
          value={ratingFilter}
          onChange={(v) => { setRatingFilter(v); setPage(1); }}
          placeholder="Оценка"
          className="w-[150px]"
        />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Период"
          className="w-[260px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareOff className="h-12 w-12" />}
          title="Нет отзывов"
          description={
            hasFilters
              ? 'Попробуйте изменить фильтры'
              : 'Отзывы появятся здесь, когда клиенты их оставят'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onApprove={handleApprove}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {total > 12 && (
            <Pagination
              page={page}
              pageSize={12}
              total={total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Reply Modal */}
      {replyReview && (
        <ReplyModal
          open
          onClose={() => setReplyReview(null)}
          review={replyReview}
          isSubmitting={replyToReview.isPending}
          onSubmit={(text) => {
            replyToReview.mutate(
              { id: replyReview._id, text },
              { onSuccess: () => setReplyReview(null) },
            );
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить отзыв?"
        description="Это действие нельзя отменить. Отзыв будет безвозвратно удалён."
        confirmText="Удалить"
        variant="danger"
        loading={deleteReview.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
