export const importKeys = {
  all: ['import'] as const,
  jobs: () => [...importKeys.all, 'jobs'] as const,
  jobsList: (page: number) => [...importKeys.jobs(), page] as const,
  job: (id: string) => [...importKeys.all, 'job', id] as const,
};
