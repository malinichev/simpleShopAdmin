import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Link2, Link2Off } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { productsApi } from '@/features/product-management';
import type { ProductFormData } from '@/features/product-management';
import { RichTextEditor } from './RichTextEditor';
import { TagsInput } from './TagsInput';

const statusOptions = [
  { value: 'draft', label: 'Черновик' },
  { value: 'active', label: 'Активен' },
  { value: 'archived', label: 'Архивирован' },
];

function toSlug(str: string): string {
  const ru: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return str
    .toLowerCase()
    .split('')
    .map((ch) => ru[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function BasicInfoSection() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<ProductFormData>();
  const [slugLinked, setSlugLinked] = useState(true);
  const name = watch('name');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const categoryOptions = [
    { value: '', label: 'Выберите категорию' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  useEffect(() => {
    if (slugLinked && name) {
      setValue('slug', toSlug(name), { shouldDirty: true });
    }
  }, [name, slugLinked, setValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Название"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Название товара"
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="URL (slug)"
                {...register('slug')}
                error={errors.slug?.message}
                placeholder="url-tovara"
                disabled={slugLinked}
              />
            </div>
            <button
              type="button"
              onClick={() => setSlugLinked(!slugLinked)}
              className="mb-[2px] rounded-lg border border-gray-300 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              title={slugLinked ? 'Отвязать от названия' : 'Привязать к названию'}
            >
              {slugLinked ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
            </button>
          </div>

          <Textarea
            label="Краткое описание"
            {...register('shortDescription')}
            error={errors.shortDescription?.message}
            placeholder="Краткое описание для карточки товара"
            rows={3}
            autoResize
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor
                label="Полное описание"
                value={field.value}
                onChange={field.onChange}
                error={errors.description?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Классификация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Материал"
            {...register('material')}
            error={errors.material?.message}
            placeholder="Полиэстер 90%, Эластан 10%"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="SKU"
              {...register('sku')}
              error={errors.sku?.message}
              placeholder="ART-001"
            />

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  label="Категория"
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                label="Статус"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                className="max-w-xs"
              />
            )}
          />

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagsInput
                label="Теги"
                value={field.value}
                onChange={field.onChange}
                placeholder="Введите тег и нажмите Enter..."
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
