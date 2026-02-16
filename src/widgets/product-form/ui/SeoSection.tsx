import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { ProductFormData } from '@/features/product-management';
import { TagsInput } from './TagsInput';

export function SeoSection() {
  const { register, control, watch, formState: { errors } } = useFormContext<ProductFormData>();

  const metaTitle = watch('metaTitle') ?? '';
  const metaDescription = watch('metaDescription') ?? '';
  const name = watch('name');
  const slug = watch('slug');

  const previewTitle = metaTitle || name || 'Название товара';
  const previewUrl = `sportshop.ru/products/${slug || 'url-tovara'}`;
  const previewDescription = metaDescription || 'Описание товара будет отображено здесь...';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              label="Meta Title"
              {...register('metaTitle')}
              error={errors.metaTitle?.message}
              placeholder="Заголовок для поисковых систем"
            />
            <p className="mt-1 text-xs text-gray-500">
              {metaTitle.length}/70 символов
            </p>
          </div>

          <div>
            <Textarea
              label="Meta Description"
              {...register('metaDescription')}
              error={errors.metaDescription?.message}
              placeholder="Описание для поисковых систем"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              {metaDescription.length}/160 символов
            </p>
          </div>

          <Controller
            control={control}
            name="metaKeywords"
            render={({ field }) => (
              <TagsInput
                label="Ключевые слова"
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Введите ключевое слово..."
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр в Google</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
            <p className="truncate text-lg text-blue-600 hover:underline">
              {previewTitle}
            </p>
            <p className="truncate text-sm text-green-700">
              {previewUrl}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {previewDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
