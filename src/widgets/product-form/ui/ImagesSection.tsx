import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  ImageUploader,
  ImageGallery,
  useImageUpload,
  type UploadResult,
  type ImageItem,
} from '@/features/image-upload';
import type { ProductFormData } from '@/features/product-management';

export function ImagesSection() {
  const { watch, setValue } = useFormContext<ProductFormData>();
  const images = watch('images') ?? [];

  const galleryImages: ImageItem[] = images.map((img, i) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    isMain: img.isMain ?? i === 0,
  }));

  const handleUploadSuccess = useCallback(
    (results: UploadResult[]) => {
      const newImages = results.map((r) => ({
        id: r.key,
        url: r.url,
        alt: '',
        isMain: false,
      }));

      const updated = [...images, ...newImages];
      // If no main image yet, set first one
      if (!updated.some((img) => img.isMain) && updated.length > 0) {
        updated[0].isMain = true;
      }
      setValue('images', updated, { shouldDirty: true });
    },
    [images, setValue],
  );

  const { upload, isUploading, progress } = useImageUpload({
    folder: 'products',
    onSuccess: handleUploadSuccess,
  });

  const handleGalleryChange = useCallback(
    (updatedImages: ImageItem[]) => {
      setValue(
        'images',
        updatedImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isMain: img.isMain,
        })),
        { shouldDirty: true },
      );
    },
    [setValue],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Изображения</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploader
          onFiles={upload}
          isUploading={isUploading}
          progress={progress}
        />
        <ImageGallery images={galleryImages} onChange={handleGalleryChange} />
      </CardContent>
    </Card>
  );
}
