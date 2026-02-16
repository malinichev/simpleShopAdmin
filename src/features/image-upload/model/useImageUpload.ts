import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadApi, type UploadResult } from '../api/uploadApi';

interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (results: UploadResult[]) => void;
}

export function useImageUpload({ folder, onSuccess }: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsUploading(true);
      setProgress(0);

      try {
        const results = await uploadApi.uploadImages(files, folder, setProgress);
        onSuccess?.(results);
        toast.success(
          files.length === 1 ? 'Изображение загружено' : `Загружено ${files.length} изображений`,
        );
        return results;
      } catch {
        toast.error('Ошибка при загрузке изображений');
        return undefined;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [folder, onSuccess],
  );

  return { upload, isUploading, progress };
}
