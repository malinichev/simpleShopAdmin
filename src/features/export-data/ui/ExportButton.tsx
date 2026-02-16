import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';

type ExportFormat = 'csv' | 'excel';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  loading?: boolean;
}

export function ExportButton({ onExport, loading }: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" loading={loading}>
          <Download className="h-4 w-4" />
          Экспорт
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onExport('csv')}>
          Экспорт CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onExport('excel')}>
          Экспорт Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
