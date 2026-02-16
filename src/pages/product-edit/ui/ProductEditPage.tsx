import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ROUTES } from '@/shared/config';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  type ProductFormData,
} from '@/features/product-management';
import { ProductForm, type ProductFormHandle } from '@/widgets/product-form';

export function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const formRef = useRef<ProductFormHandle | null>(null);

  const { data: product, isLoading } = useProduct(id ?? '');
  console.log({product})
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const handleSubmit = (data: ProductFormData) => {
    if (isEdit && id) {
      updateProduct.mutate(
        { id, data },
        { onSuccess: () => navigate(ROUTES.PRODUCTS) },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => navigate(ROUTES.PRODUCTS),
      });
    }
  };

  const handleSaveDraft = () => {
    const handle = formRef.current;
    if (!handle) return;
    const form = handle.getForm();
    form.setValue('status', 'draft');
    form.handleSubmit(handleSubmit)();
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PRODUCTS)}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? `Редактирование: ${product?.name ?? ''}` : 'Новый товар'}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {isEdit ? 'Изменение данных товара' : 'Заполните информацию о товаре'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        initialData={isEdit ? product : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formRef={formRef}
      />

      {/* Action buttons */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/80 px-1 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.PRODUCTS)}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSaveDraft}
          loading={isSubmitting}
        >
          <Save className="h-4 w-4" />
          Сохранить как черновик
        </Button>
        <Button
          type="submit"
          form="product-form"
          loading={isSubmitting}
        >
          <Globe className="h-4 w-4" />
          Опубликовать
        </Button>
      </div>
    </div>
  );
}
