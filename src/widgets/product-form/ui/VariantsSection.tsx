import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { ProductFormData } from '@/features/product-management';

export function VariantsSection() {
  const { register, control, formState: { errors } } = useFormContext<ProductFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Варианты</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ id: '', size: '', color: '', colorHex: '#000000', sku: '', stock: 0, price: undefined })}
        >
          <Plus className="h-4 w-4" />
          Добавить вариант
        </Button>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Нет вариантов. Добавьте варианты, если товар доступен в разных размерах или цветах.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500">Размер</th>
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500">Цвет</th>
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500 w-16">Hex</th>
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500">SKU</th>
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500">Остаток</th>
                  <th className="pb-2 pr-3 text-left font-medium text-gray-500">Цена (₽)</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const variantErrors = errors.variants?.[index];
                  return (
                    <tr key={field.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-3">
                        <input
                          {...register(`variants.${index}.size`)}
                          placeholder="XS, S, M..."
                          className={inputClass(variantErrors?.size)}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          {...register(`variants.${index}.color`)}
                          placeholder="Чёрный"
                          className={inputClass(variantErrors?.color)}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="color"
                          {...register(`variants.${index}.colorHex`)}
                          className="h-8 w-10 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5 dark:border-gray-700"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          {...register(`variants.${index}.sku`)}
                          placeholder="SKU-001-XS"
                          className={inputClass(variantErrors?.sku)}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min="0"
                          {...register(`variants.${index}.stock`)}
                          placeholder="0"
                          className={inputClass(variantErrors?.stock, 'w-20')}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`variants.${index}.price`)}
                          placeholder="—"
                          className={inputClass(variantErrors?.price, 'w-24')}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function inputClass(error?: { message?: string }, extra = '') {
  const base =
    'w-full rounded-md border bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white';
  const border = error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700';
  return `${base} ${border} ${extra}`.trim();
}
