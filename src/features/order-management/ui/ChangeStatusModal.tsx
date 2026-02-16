import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import type { OrderStatus } from '@/shared/constants';
import { orderStatuses } from '@/shared/constants';
import { OrderStatusBadge } from './OrderStatusBadge';

/** Allowed transitions from each status */
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: OrderStatus;
  onSubmit: (status: OrderStatus, comment?: string) => void;
  isSubmitting?: boolean;
}

export function ChangeStatusModal({
  open,
  onClose,
  currentStatus,
  onSubmit,
  isSubmitting,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<string>('');
  const [comment, setComment] = useState('');

  const available = allowedTransitions[currentStatus];
  const statusOptions = available.map((s) => ({
    value: s,
    label: orderStatuses[s].label,
  }));

  const handleSubmit = () => {
    if (!newStatus) return;
    onSubmit(newStatus as OrderStatus, comment || undefined);
  };

  const handleClose = () => {
    setNewStatus('');
    setComment('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Изменить статус заказа">
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">Текущий статус</p>
          <OrderStatusBadge status={currentStatus} />
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Для текущего статуса нет доступных переходов.
          </p>
        ) : (
          <>
            <Select
              label="Новый статус"
              options={statusOptions}
              value={newStatus}
              onChange={setNewStatus}
              placeholder="Выберите статус"
            />

            <Textarea
              label="Комментарий (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Причина изменения статуса..."
              rows={3}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          {available.length > 0 && (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!newStatus}
            >
              Изменить статус
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
