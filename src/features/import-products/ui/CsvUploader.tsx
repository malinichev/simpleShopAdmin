import { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface CsvUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function CsvUploader({ onFileSelect, isLoading }: CsvUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-primary-400 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500"
    >
      <Upload className="mb-4 h-10 w-10 text-gray-400" />
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        Перетащите CSV файл сюда или{' '}
        <label className="cursor-pointer font-medium text-primary-600 hover:underline">
          выберите файл
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
            disabled={isLoading}
          />
        </label>
      </p>
      <p className="text-xs text-gray-400">Формат: CSV, кодировка UTF-8</p>
      {isLoading && (
        <div className="mt-4 h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      )}
    </div>
  );
}
