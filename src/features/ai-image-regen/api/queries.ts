export const regenKeys = {
  all: ['image-regen'] as const,
  config: () => [...regenKeys.all, 'config'] as const,
  job: (id: string) => [...regenKeys.all, 'job', id] as const,
};
