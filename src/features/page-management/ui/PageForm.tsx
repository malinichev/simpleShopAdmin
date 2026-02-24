import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { pageSchema, type PageFormData } from '../lib/pageValidation';

interface PageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PageFormData) => void;
  isSubmitting?: boolean;
}

export function PageForm({ open, onClose, onSubmit, isSubmitting }: PageFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: { slug: '', title: '', isPublished: false },
  });

  useEffect(() => {
    if (!open) {
      reset({ slug: '', title: '', isPublished: false });
    }
  }, [open, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Создать страницу">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('slug')}
            placeholder="about"
            error={errors.slug?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            URL страницы: /pages/slug. Только строчные буквы, цифры и дефисы.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Название <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('title')}
            placeholder="О нас"
            error={errors.title?.message}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Опубликовать</p>
            <p className="text-xs text-gray-500">Страница будет доступна публично</p>
          </div>
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
