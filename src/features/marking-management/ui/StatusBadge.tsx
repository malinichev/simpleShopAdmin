import type { MarkingCodeStatus } from '../api/markingApi';

const statusConfig: Record<MarkingCodeStatus, { label: string; className: string }> = {
  in_stock: { label: 'На складе', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  reserved: { label: 'Резерв', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  sold: { label: 'Продан', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  returned: { label: 'Возврат', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  written_off: { label: 'Списан', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

interface StatusBadgeProps {
  status: MarkingCodeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
