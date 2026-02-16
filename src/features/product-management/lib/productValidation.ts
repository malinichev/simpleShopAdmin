import { z } from 'zod';

export const imageSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string().default(''),
  isMain: z.boolean().default(false),
});

export const variantSchema = z.object({
  id: z.string().optional().default(''),
  size: z.string().min(1, 'Размер обязателен'),
  color: z.string().min(1, 'Цвет обязателен'),
  colorHex: z.string().optional().default('#000000'),
  sku: z.string().min(1, 'SKU обязателен'),
  stock: z.coerce.number().min(0, 'Остаток не может быть отрицательным'),
  price: z.coerce.number().min(0).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(200, 'Макс. 200 символов'),
  slug: z.string().optional().default(''),
  shortDescription: z.string().max(500, 'Макс. 500 символов').optional().default(''),
  description: z.string().optional().default(''),
  sku: z.string().min(1, 'SKU обязателен'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  comparePrice: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'draft', 'archived', 'out_of_stock']).default('draft'),
  tags: z.array(z.string()).default([]),
  material: z.string().min(1, 'Материал обязателен'),
  activityTypes: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  metaTitle: z.string().max(70, 'Макс. 70 символов').optional(),
  metaDescription: z.string().max(160, 'Макс. 160 символов').optional(),
  metaKeywords: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
