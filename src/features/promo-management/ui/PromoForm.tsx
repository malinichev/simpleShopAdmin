import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shuffle, X, ChevronDown, Check } from 'lucide-react';
import type { Resolver } from 'react-hook-form';
import { Modal } from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { cn } from '@/shared/lib/utils';
import type { Promotion } from '@/entities/promotion';
import { useCategoriesFlat } from '@/features/category-management';
import { useProducts } from '@/features/product-management';

// --- Schema ---

const promoSchema = z.object({
  code: z.string().min(1, 'Код обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.coerce.number().min(0, 'Значение должно быть >= 0'),
  minOrderAmount: z.coerce.number().min(0).optional().or(z.literal('')),
  maxDiscount: z.coerce.number().min(0).optional().or(z.literal('')),
  usageLimit: z.coerce.number().min(1).optional().or(z.literal('')),
  usageLimitPerUser: z.coerce.number().min(1).optional().or(z.literal('')),
  categoryIds: z.array(z.string()),
  productIds: z.array(z.string()),
  excludeProductIds: z.array(z.string()),
  startDate: z.date({ error: 'Дата начала обязательна' }),
  endDate: z.date({ error: 'Дата окончания обязательна' }),
  isActive: z.boolean(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['endDate'],
}).refine((data) => {
  if (data.type === 'percentage' && data.value > 100) return false;
  return true;
}, {
  message: 'Процент не может превышать 100',
  path: ['value'],
});

type PromoFormData = z.infer<typeof promoSchema>;

// --- Helpers ---

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const typeOptions = [
  { value: 'percentage', label: 'Процент (%)' },
  { value: 'fixed', label: 'Фиксированная (₽)' },
  { value: 'free_shipping', label: 'Бесплатная доставка' },
];

// --- MultiSelect ---

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}

function MultiSelect({ label, options, value, onChange, placeholder = 'Выберите...', searchable }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="w-full" ref={ref}>
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-[40px] w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          open && 'ring-2 ring-primary-500 ring-offset-1',
        )}
      >
        <span className={cn('truncate', selectedLabels.length === 0 && 'text-gray-400')}>
          {selectedLabels.length > 0 ? `Выбрано: ${selectedLabels.length}` : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {selectedLabels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {value.map((v) => {
            const lbl = options.find((o) => o.value === v)?.label ?? v;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
              >
                {lbl}
                <button type="button" onClick={() => toggle(v)} className="hover:text-primary-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="relative z-50 mt-1 max-h-52 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {searchable && (
            <div className="sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-400">Ничего не найдено</div>
          ) : (
            filtered.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                    selected && 'bg-primary-50 dark:bg-primary-900/10',
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    selected
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 dark:border-gray-600',
                  )}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate text-gray-700 dark:text-gray-200">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// --- PromoForm ---

interface PromoFormProps {
  open: boolean;
  onClose: () => void;
  promotion?: Promotion | null;
  onSubmit: (data: PromoFormData) => void;
  isSubmitting?: boolean;
}

export type { PromoFormData };

export function PromoForm({ open, onClose, promotion, onSubmit, isSubmitting }: PromoFormProps) {
  const isEdit = Boolean(promotion);

  const { data: categories } = useCategoriesFlat();
  const { data: productsData } = useProducts({ page: 1, limit: 100 });

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ value: c._id, label: c.name })),
    [categories],
  );

  const productOptions = useMemo(
    () => (productsData?.data ?? []).map((p) => ({ value: p._id, label: p.name })),
    [productsData],
  );

  const resolver: Resolver<PromoFormData> = zodResolver(promoSchema) as Resolver<PromoFormData>;

  const form = useForm<PromoFormData>({
    resolver,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      usageLimitPerUser: '',
      categoryIds: [],
      productIds: [],
      excludeProductIds: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  const promoType = watch('type');

  useEffect(() => {
    if (open) {
      if (promotion) {
        reset({
          code: promotion.code,
          name: promotion.name,
          description: promotion.description ?? '',
          type: promotion.type,
          value: promotion.value,
          minOrderAmount: promotion.minOrderAmount ?? '',
          maxDiscount: promotion.maxDiscount ?? '',
          usageLimit: promotion.usageLimit ?? '',
          usageLimitPerUser: promotion.usageLimitPerUser ?? '',
          categoryIds: promotion.categoryIds,
          productIds: promotion.productIds,
          excludeProductIds: promotion.excludeProductIds,
          startDate: new Date(promotion.startDate),
          endDate: new Date(promotion.endDate),
          isActive: promotion.isActive,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          type: 'percentage',
          value: 0,
          minOrderAmount: '',
          maxDiscount: '',
          usageLimit: '',
          usageLimitPerUser: '',
          categoryIds: [],
          productIds: [],
          excludeProductIds: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        });
      }
    }
  }, [open, promotion, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать промокод' : 'Новый промокод'}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {/* Code + Generate */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Код промокода"
              {...register('code')}
              error={errors.code?.message}
              placeholder="SUMMER2024"
              className="font-mono uppercase"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue('code', generateCode())}
            className="mb-[2px]"
          >
            <Shuffle className="mr-1.5 h-4 w-4" />
            Сгенерировать
          </Button>
        </div>

        <Input
          label="Название"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Летняя распродажа"
        />

        <Textarea
          label="Описание"
          {...register('description')}
          placeholder="Описание промокода"
          rows={2}
        />

        {/* Type + Value */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                label="Тип скидки"
                options={typeOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {promoType !== 'free_shipping' && (
            <Input
              label={promoType === 'percentage' ? 'Значение (%)' : 'Значение (₽)'}
              type="number"
              step="0.01"
              {...register('value')}
              error={errors.value?.message}
              placeholder="0"
            />
          )}
        </div>

        {/* Min order + Max discount */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Мин. сумма заказа (₽)"
            type="number"
            step="0.01"
            {...register('minOrderAmount')}
            placeholder="Не ограничено"
          />
          {promoType === 'percentage' && (
            <Input
              label="Макс. скидка (₽)"
              type="number"
              step="0.01"
              {...register('maxDiscount')}
              placeholder="Не ограничено"
            />
          )}
        </div>

        {/* Usage limits */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Лимит использований (общий)"
            type="number"
            {...register('usageLimit')}
            placeholder="Без лимита"
          />
          <Input
            label="Лимит на пользователя"
            type="number"
            {...register('usageLimitPerUser')}
            placeholder="Без лимита"
          />
        </div>

        {/* Categories / Products */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Область применения
          </p>

          <div className="space-y-3">
            <Controller
              control={control}
              name="categoryIds"
              render={({ field }) => (
                <MultiSelect
                  label="Категории"
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Все категории"
                />
              )}
            />

            <Controller
              control={control}
              name="productIds"
              render={({ field }) => (
                <MultiSelect
                  label="Товары"
                  options={productOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Все товары"
                  searchable
                />
              )}
            />

            <Controller
              control={control}
              name="excludeProductIds"
              render={({ field }) => (
                <MultiSelect
                  label="Исключить товары"
                  options={productOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Нет исключений"
                  searchable
                />
              )}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Период действия
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дата начала
                  </span>
                  <DatePicker value={field.value} onChange={(d) => field.onChange(d ?? new Date())} />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дата окончания
                  </span>
                  <DatePicker value={field.value} onChange={(d) => field.onChange(d ?? new Date())} />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Active */}
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Checkbox
              label="Активен"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        {/* Submit */}
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
