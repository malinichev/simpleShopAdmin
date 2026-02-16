export const settingsKeys = {
  all: ['settings'] as const,
  general: () => [...settingsKeys.all, 'general'] as const,
  shipping: () => [...settingsKeys.all, 'shipping'] as const,
  payment: () => [...settingsKeys.all, 'payment'] as const,
};
