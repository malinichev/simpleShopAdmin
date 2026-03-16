import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { useBulkImportCodes } from '../model/useBulkImportCodes';

interface ImportCodesDialogProps {
  variantId: string;
  open: boolean;
  onClose: () => void;
}

export function ImportCodesDialog({ variantId, open, onClose }: ImportCodesDialogProps) {
  const [codesText, setCodesText] = useState('');
  const bulkImport = useBulkImportCodes();

  if (!open) return null;

  const handleImport = () => {
    const codes = codesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (codes.length === 0) return;

    bulkImport.mutate(
      { variantId, codes },
      {
        onSuccess: () => {
          setCodesText('');
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Импорт кодов маркировки
        </h2>

        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Вставьте коды DataMatrix, по одному на строку.
        </p>

        <textarea
          value={codesText}
          onChange={(e) => setCodesText(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:text-white"
          placeholder={"010460712345678921ABC123\n010460712345678921DEF456\n010460712345678921GHI789"}
        />

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={handleImport}
            loading={bulkImport.isPending}
            disabled={!codesText.trim()}
          >
            Импортировать
          </Button>
        </div>
      </div>
    </div>
  );
}
