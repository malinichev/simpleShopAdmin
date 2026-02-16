import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DataTableToolbarProps {
  children: ReactNode;
  className?: string;
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-4', className)}>
      {children}
    </div>
  );
}
