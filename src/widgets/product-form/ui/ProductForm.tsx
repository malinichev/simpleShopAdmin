import { useForm, FormProvider, type UseFormReturn, type Resolver } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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

export interface ProductFormHandle {
  getForm: () => UseFormReturn<ProductFormData>;
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
  formRef?: React.MutableRefObject<ProductFormHandle | null>;
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
    images: sorted.map((img, i) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? '',
      isMain: i === 0,
    })),
    variants: (product.variants ?? []).map((v) => ({
      id: v.id ?? '',
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? '#000000',
      sku: v.sku,
      stock: v.stock,
      price: v.price,
    })),
    metaTitle: product.seo?.title,
    metaDescription: product.seo?.description,
    metaKeywords: product.seo?.keywords,
  };
}

export function ProductForm({ initialData, onSubmit, isSubmitting, formRef }: ProductFormProps) {
  const resolver: Resolver<ProductFormData> = zodResolver(productSchema) as Resolver<ProductFormData>

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
      material: '',
      activityTypes: [],
      features: [],
      images: [],
      variants: [],
      metaKeywords: [],
    }
  });

  useEffect(() => {
    if (formRef) {
      formRef.current = { getForm: () => form };
    }
  }, [form, formRef]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="product-form" className="space-y-6">
        <Tabs defaultValue="basic">
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

        {/* Hidden submit for keyboard Enter — actual buttons are in the page */}
        <input type="submit" hidden disabled={isSubmitting} />
      </form>
    </FormProvider>
  );
}
