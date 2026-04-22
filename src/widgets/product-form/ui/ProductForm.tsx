import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type Resolver,
  type FieldErrors,
  type Path,
} from 'react-hook-form';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import {
  productSchema,
  type ProductFormData,
} from '@/features/product-management';
import type { Product } from '@/entities/product';
import { BasicInfoSection } from './BasicInfoSection';
import { PricingSection } from './PricingSection';
import { VariantsSection } from './VariantsSection';
import { ImagesSection } from './ImagesSection';
import { SeoSection } from './SeoSection';

type TabId = 'basic' | 'pricing' | 'images' | 'seo';

export interface ProductFormHandle {
  getForm: () => UseFormReturn<ProductFormData>;
  submit: (status: 'draft' | 'active') => void;
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
  formRef?: React.MutableRefObject<ProductFormHandle | null>;
}

const FIELD_TO_TAB: Record<string, TabId> = {
  name: 'basic',
  slug: 'basic',
  sku: 'basic',
  categoryId: 'basic',
  shortDescription: 'basic',
  description: 'basic',
  material: 'basic',
  activityTypes: 'basic',
  features: 'basic',
  tags: 'basic',
  color: 'basic',
  colorHex: 'basic',
  modelId: 'basic',
  gtin: 'basic',
  requiresMarking: 'basic',
  price: 'pricing',
  comparePrice: 'pricing',
  variants: 'pricing',
  images: 'images',
  metaTitle: 'seo',
  metaDescription: 'seo',
  metaKeywords: 'seo',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Название',
  slug: 'URL (slug)',
  sku: 'SKU',
  categoryId: 'Категория',
  shortDescription: 'Краткое описание',
  description: 'Описание',
  material: 'Материал',
  activityTypes: 'Виды активности',
  features: 'Особенности',
  tags: 'Теги',
  color: 'Цвет',
  colorHex: 'Цвет (HEX)',
  modelId: 'ID модели',
  gtin: 'GTIN',
  price: 'Цена',
  comparePrice: 'Цена до скидки',
  variants: 'Варианты',
  images: 'Изображения',
  metaTitle: 'Meta Title',
  metaDescription: 'Meta Description',
  metaKeywords: 'Meta Keywords',
};

function collectErrorMessages(
  errors: FieldErrors,
  pathPrefix = '',
): string[] {
  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const node = (errors as Record<string, unknown>)[key];
    if (!node || typeof node !== 'object') continue;

    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const maybeMessage = (node as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      const label = pathPrefix
        ? currentPath
        : FIELD_LABELS[key] ?? key;
      messages.push(`${label}: ${maybeMessage}`);
      continue;
    }

    if (Array.isArray(node)) {
      node.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          messages.push(
            ...collectErrorMessages(
              item as FieldErrors,
              `${FIELD_LABELS[key] ?? key}[${idx + 1}]`,
            ),
          );
        }
      });
      continue;
    }

    messages.push(...collectErrorMessages(node as FieldErrors, currentPath));
  }
  return messages;
}

function productToFormData(product: Product): ProductFormData {
  const sorted = [...(product.images ?? [])].sort((a, b) => a.order - b.order);

  return {
    name: product.name,
    slug: product.slug ?? '',
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    sku: product.sku,
    categoryId: product.categoryId,
    price: product.price,
    comparePrice: product.compareAtPrice,
    status: product.status,
    tags: product.tags ?? [],
    material: product.attributes?.material ?? '',
    activityTypes: product.attributes?.activity ?? [],
    features: product.attributes?.features ?? [],
    color: product.color ?? '',
    colorHex: product.colorHex ?? '#000000',
    modelId: product.modelId ?? '',
    gtin: product.gtin ?? '',
    requiresMarking: product.requiresMarking ?? false,
    images: sorted.map((img, i) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? '',
      isMain: i === 0,
    })),
    variants: (product.variants ?? []).map((v) => ({
      id: v.id ?? '',
      size: v.size,
      sku: v.sku,
      stock: v.stock,
      price: v.price,
      gtin: v.gtin ?? '',
    })),
    metaTitle: product.seo?.title,
    metaDescription: product.seo?.description,
    metaKeywords: product.seo?.keywords,
  };
}

export function ProductForm({ initialData, onSubmit, isSubmitting, formRef }: ProductFormProps) {
  const resolver: Resolver<ProductFormData> = zodResolver(productSchema) as Resolver<ProductFormData>;
  const [activeTab, setActiveTab] = useState<TabId>('basic');

  const form = useForm<ProductFormData>({
    resolver,
    defaultValues: initialData ? productToFormData(initialData) : {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      sku: '',
      categoryId: '',
      price: 0,
      status: 'draft',
      tags: [],
      color: '',
      colorHex: '#000000',
      modelId: '',
      gtin: '',
      requiresMarking: false,
      material: '',
      activityTypes: [],
      features: [],
      images: [],
      variants: [],
      metaKeywords: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(productToFormData(initialData));
    }
  }, [initialData, form]);

  const onInvalid = (errors: FieldErrors<ProductFormData>) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      const targetTab = FIELD_TO_TAB[firstField] ?? 'basic';
      setActiveTab(targetTab);
      try {
        form.setFocus(firstField as Path<ProductFormData>);
      } catch {
        // setFocus может упасть на полях-массивах — не страшно
      }
    }

    const messages = collectErrorMessages(errors).slice(0, 5);
    toast.error('Не удалось сохранить — проверьте форму', {
      description: messages.length > 0 ? messages.join('\n') : undefined,
    });
  };

  useEffect(() => {
    if (!formRef) return;
    formRef.current = {
      getForm: () => form,
      submit: (status) => {
        form.setValue('status', status);
        form.handleSubmit(onSubmit, onInvalid)();
      },
    };
    // onSubmit/onInvalid читаются через замыкание — обновляем ref при смене form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formRef]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} id="product-form" className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList>
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="pricing">Цены и варианты</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoSection />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingSection />
            <VariantsSection />
          </TabsContent>

          <TabsContent value="images">
            <ImagesSection />
          </TabsContent>

          <TabsContent value="seo">
            <SeoSection />
          </TabsContent>
        </Tabs>

        <button type="submit" hidden disabled={isSubmitting} aria-hidden="true" tabIndex={-1} />
      </form>
    </FormProvider>
  );
}
