import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
  ImageUploader,
  ImageGallery,
  useImageUpload,
  type UploadResult,
  type ImageItem,
} from '@/features/image-upload';
import { AiRegenDialog, useRegenConfig, type RegenReplacement } from '@/features/ai-image-regen';
import type { ProductFormData } from '@/features/product-management';

export function ImagesSection() {
  const { id: productId } = useParams<{ id: string }>();
  const { watch, setValue } = useFormContext<ProductFormData>();
  const rawImages = watch('images');
  const productName = watch('name');
  const images = useMemo(() => rawImages ?? [], [rawImages]);

  const { data: regenConfig } = useRegenConfig();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  // id фото, заменённых через ИИ в этой сессии (бейдж в галерее)
  const [aiIds, setAiIds] = useState<Set<string>>(new Set());

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

  /** Замена выбранных фото результатами ИИ-генерации (в форме; сохранение — штатное). */
  const handleApplyRegen = useCallback(
    (replacements: RegenReplacement[]) => {
      const byId = new Map(replacements.map((r) => [r.imageId, r.url]));
      setValue(
        'images',
        images.map((img) =>
          byId.has(img.id) ? { ...img, url: byId.get(img.id)! } : img,
        ),
        { shouldDirty: true },
      );
      setAiIds((prev) => new Set([...prev, ...byId.keys()]));
    },
    [images, setValue],
  );

  const aiButtonVisible = regenConfig?.enabled === true && !!productId;
  const aiButtonDisabled = !!productId && images.length === 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Изображения</CardTitle>
        {aiButtonVisible && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={aiButtonDisabled}
            onClick={() => setAiDialogOpen(true)}
            title="Перегенерировать выбранные фото с помощью ИИ в стиле магазина"
          >
            <Sparkles className="h-4 w-4" />
            ИИ-перегенерация
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploader
          onFiles={upload}
          isUploading={isUploading}
          progress={progress}
        />
        <ImageGallery
          images={galleryImages}
          onChange={handleGalleryChange}
          aiIds={aiIds}
        />
        {productId && (
          <AiRegenDialog
            open={aiDialogOpen}
            onClose={() => setAiDialogOpen(false)}
            targets={[
              {
                productId,
                productName: productName || 'Товар',
                images: galleryImages,
              },
            ]}
            onApply={handleApplyRegen}
          />
        )}
      </CardContent>
    </Card>
  );
}
