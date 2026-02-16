export const orderStatuses = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'В обработке', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Отправлен', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Доставлен', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Возвращён', color: 'bg-gray-100 text-gray-800' },
} as const;

export type OrderStatus = keyof typeof orderStatuses;
