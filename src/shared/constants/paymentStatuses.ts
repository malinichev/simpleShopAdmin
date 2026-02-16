export const paymentStatuses = {
  pending: { label: 'Ожидает' },
  paid: { label: 'Оплачен' },
  failed: { label: 'Ошибка' },
  refunded: { label: 'Возврат' },
} as const;

export type PaymentStatusKey = keyof typeof paymentStatuses;
