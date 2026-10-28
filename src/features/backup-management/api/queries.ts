export const backupKeys = {
  all: ['backups'] as const,
  list: () => [...backupKeys.all, 'list'] as const,
};
