import { z } from 'zod';

export const pageSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug обязателен')
    .max(100, 'Макс. 100 символов')
    .regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры и дефисы'),
  title: z.string().min(1, 'Название обязательно').max(200, 'Макс. 200 символов'),
  metaTitle: z.string().max(200, 'Макс. 200 символов').optional(),
  metaDescription: z.string().max(500, 'Макс. 500 символов').optional(),
  isPublished: z.boolean(),
});

export type PageFormData = z.infer<typeof pageSchema>;
