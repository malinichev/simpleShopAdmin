import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { ProductFormData } from '@/features/product-management';

export function PricingSection() {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Цены</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Базовая цена (₽)"
            type="number"
            step="0.01"
            min="0"
            {...register('price')}
            error={errors.price?.message}
            placeholder="0.00"
          />
          <Input
            label="Цена до скидки (₽)"
            type="number"
            step="0.01"
            min="0"
            {...register('comparePrice')}
            error={errors.comparePrice?.message}
            placeholder="0.00"
            helperText="Если указана, базовая цена будет отображена как скидочная"
          />
        </div>
      </CardContent>
    </Card>
  );
}
