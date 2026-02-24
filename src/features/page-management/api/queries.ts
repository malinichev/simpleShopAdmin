export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  detail: (slug: string) => [...pageKeys.all, 'detail', slug] as const,
  files: () => [...pageKeys.all, 'files'] as const,
};
