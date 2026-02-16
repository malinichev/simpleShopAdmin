export const productStatuses = {
  active: { label: 'Активен', color: 'bg-green-100 text-green-800' },
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  archived: { label: 'Архивирован', color: 'bg-yellow-100 text-yellow-800' },
  out_of_stock: { label: 'Нет в наличии', color: 'bg-red-100 text-red-800' },
} as const;

export type ProductStatus = keyof typeof productStatuses;
