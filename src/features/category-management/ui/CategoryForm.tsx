import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2, Link2Off } from 'lucide-react';
import type { Resolver } from 'react-hook-form';
import { Modal } from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import type { Category } from '@/entities/category';
import { categorySchema, type CategoryFormData } from '../lib/categoryValidation';

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

function getDescendantIds(category: Category): string[] {
  const ids: string[] = [category._id];
  category.children?.forEach((child) => {
    ids.push(...getDescendantIds(child));
  });
  return ids;
}

function flattenTree(categories: Category[]): Category[] {
  const result: Category[] = [];
  function walk(cats: Category[]) {
    for (const cat of cats) {
      result.push(cat);
      if (cat.children?.length) walk(cat.children);
    }
  }
  walk(categories);
  return result;
}

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  parentId?: string;
  allCategories: Category[];
  onSubmit: (data: CategoryFormData) => void;
  isSubmitting?: boolean;
}

export function CategoryForm({
  open,
  onClose,
  category,
  parentId,
  allCategories,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const isEdit = Boolean(category);
  const [slugLinked, setSlugLinked] = useState(!isEdit);

  const resolver: Resolver<CategoryFormData> = zodResolver(categorySchema) as Resolver<CategoryFormData>;

  const form = useForm<CategoryFormData>({
    resolver,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: parentId ?? '',
      isActive: true,
      seoTitle: '',
      seoDescription: '',
    },
  });

  const { register, control, watch, setValue, reset, handleSubmit, formState: { errors } } = form;
  const name = watch('name');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          image: category.image ?? '',
          parentId: category.parentId ?? '',
          isActive: category.isActive,
          seoTitle: category.seo?.title ?? '',
          seoDescription: category.seo?.description ?? '',
        });
        setSlugLinked(false);
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          image: '',
          parentId: parentId ?? '',
          isActive: true,
          seoTitle: '',
          seoDescription: '',
        });
        setSlugLinked(true);
      }
    }
  }, [open, category, parentId, reset]);

  useEffect(() => {
    if (slugLinked && name) {
      setValue('slug', toSlug(name));
    }
  }, [name, slugLinked, setValue]);

  // Build parent options, excluding current category and its descendants
  const excludeIds = category ? getDescendantIds(category) : [];
  const flat = flattenTree(allCategories);
  const parentOptions = [
    { value: '', label: 'Без родителя (корневая)' },
    ...flat
      .filter((c) => !excludeIds.includes(c._id))
      .map((c) => ({ value: c._id, label: c.name })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать категорию' : 'Новая категория'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Название категории"
        />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Slug"
              {...register('slug')}
              error={errors.slug?.message}
              placeholder="url-kategorii"
              disabled={slugLinked}
            />
          </div>
          <button
            type="button"
            onClick={() => setSlugLinked(!slugLinked)}
            className="mb-[2px] rounded-lg border border-gray-300 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            {slugLinked ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
          </button>
        </div>

        <Textarea
          label="Описание"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Описание категории"
          rows={3}
        />

        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <Select
              label="Родительская категория"
              options={parentOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Input
          label="URL изображения"
          {...register('image')}
          placeholder="https://..."
        />

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Checkbox
              label="Активна"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">SEO</p>
          <div className="space-y-3">
            <Input
              label="Meta Title"
              {...register('seoTitle')}
              error={errors.seoTitle?.message}
              placeholder="Заголовок для поисковиков"
            />
            <Textarea
              label="Meta Description"
              {...register('seoDescription')}
              error={errors.seoDescription?.message}
              placeholder="Описание для поисковиков"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
