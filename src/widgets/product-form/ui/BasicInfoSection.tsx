import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Link2, Link2Off, Plus } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
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
    ...categories.map((c) => ({ value: c.id, label: c.name })),
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Цвет"
              {...register('color')}
              error={errors.color?.message}
              placeholder="Чёрный"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hex цвета
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register('colorHex')}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5 dark:border-gray-700"
                />
                <Input
                  {...register('colorHex')}
                  placeholder="#000000"
                  error={errors.colorHex?.message}
                />
              </div>
            </div>
            {/* Пикер модели (связка цветов) вместо ручного UUID (план п.5) */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Модель (связка цветов)
              </label>
              <Controller
                name="modelId"
                render={({ field }) => {
                  const { data: models } = useQuery({
                    queryKey: ['product-models'],
                    queryFn: () => productsApi.getModels(),
                    staleTime: 30_000,
                  });
                  const selectedModel = models?.find((m) => m.modelId === field.value);

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={field.value ?? ''}
                          onChange={(v) => field.onChange(v || undefined)}
                          options={[
                            { value: '', label: '— без модели —' },
                            ...(models ?? []).map((m) => ({
                              value: m.modelId,
                              label: `${m.name} × ${m.products.length} цветов`,
                            })),
                          ]}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange(crypto.randomUUID())
                          }
                          title="Создать новую модель (связку)"
                        >
                          <Plus className="w-4 h-4" />
                          Новая
                        </Button>
                      </div>
                      {selectedModel && selectedModel.products.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedModel.products.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs"
                            >
                              {p.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ background: p.colorHex }}
                                />
                              )}
                              {p.color ?? p.name.slice(0, 20)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {errors.modelId?.message && (
                <p className="text-sm text-red-500 mt-1">{errors.modelId.message}</p>
              )}
            </div>
          </div>

          <Input
            label="Материал"
            {...register('material')}
            error={errors.material?.message}
            placeholder="Полиэстер 90%, Эластан 10%"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="SKU"
              {...register('sku')}
              error={errors.sku?.message}
              placeholder="ART-001"
            />

            <Input
              label="GTIN (Честный знак)"
              {...register('gtin')}
              error={errors.gtin?.message}
              placeholder="4607123456789"
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresMarking"
              {...register('requiresMarking')}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <label htmlFor="requiresMarking" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Подлежит маркировке (Честный знак)
            </label>
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
