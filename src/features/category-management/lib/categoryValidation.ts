import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Макс. 100 символов'),
  slug: z.string().optional().default(''),
  description: z.string().max(500, 'Макс. 500 символов').optional().default(''),
  image: z.string().optional().default(''),
  parentId: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(70, 'Макс. 70 символов').optional().default(''),
  seoDescription: z.string().max(160, 'Макс. 160 символов').optional().default(''),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
