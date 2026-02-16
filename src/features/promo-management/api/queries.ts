export const promoKeys = {
  all: ['promotions'] as const,
  lists: () => [...promoKeys.all, 'list'] as const,
  detail: (id: string) => [...promoKeys.all, 'detail', id] as const,
};
