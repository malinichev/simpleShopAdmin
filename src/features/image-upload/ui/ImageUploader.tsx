import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploaderProps {
  onFiles: (files: File[]) => void;
  isUploading?: boolean;
  progress?: number;
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({
  onFiles,
  isUploading,
  progress = 0,
  disabled,
  className,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: readonly { file: File; errors: readonly { message: string }[] }[]) => {
      if (rejected.length > 0) {
        const errors = rejected.flatMap((r) => r.errors.map((e) => e.message));
        const unique = [...new Set(errors)];
        toast.error(unique.join('. '));
      }
      if (accepted.length > 0) {
        onFiles(accepted);
      }
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: 10,
    disabled: disabled || isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        (disabled || isUploading) && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{progress}% загружено...</p>
        </div>
      ) : isDragActive ? (
        <>
          <Upload className="mb-2 h-8 w-8 text-primary-500" />
          <p className="text-sm font-medium text-primary-600">Отпустите файлы для загрузки</p>
        </>
      ) : (
        <>
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Перетащите изображения сюда или нажмите для выбора
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            JPG, PNG, WebP до 5 МБ. Максимум 10 файлов.
          </p>
        </>
      )}
    </div>
  );
}
