import { z } from 'zod';

const jsonRecordSchema = z.union([
  z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),

  z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON format',
      });

      return z.NEVER;
    }
  }),
]);

export const createProductSchema = z.object({
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters').max(50),

  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(150),

  category: z.string().trim().min(2, 'Category is required').max(50),


  price: z.coerce.number().min(0, 'Price must be a positive number'),

  stock_quantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative').default(0),

  description: z.string().trim().max(2000).optional().nullable(),

  specs: jsonRecordSchema.optional().nullable(),

  bench_stats: jsonRecordSchema.optional().nullable(),

  image_url: z.string().trim().max(255).optional().nullable(),

  is_active: z
    .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
    .default(true),
});

export const updateProductSchema = z.object({
  sku: z.string().trim().min(2).max(50).optional(),

  name: z.string().trim().min(2).max(150).optional(),

  category: z.string().trim().min(2).max(50).optional(),

  swatch: z.string().trim().max(100).optional().nullable(),

  price: z.coerce.number().min(0).optional(),

  stock_quantity: z.coerce.number().int().min(0).optional(),

  description: z.string().trim().max(2000).optional().nullable(),

  specs: jsonRecordSchema.optional().nullable(),

  bench_stats: jsonRecordSchema.optional().nullable(),

  image_url: z.string().trim().max(255).optional().nullable(),

  is_active: z
    .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
    .optional(),
});

export const productQuerySchema = z.object({
  category: z.string().trim().optional(),

  search: z.string().trim().optional(),

  minPrice: z.coerce.number().min(0).optional(),

  maxPrice: z.coerce.number().min(0).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  is_active: z.union([z.boolean(), z.string()]).optional(),
});

export const formatValidationError = (error: z.ZodError) => ({
  message: 'Invalid product data',

  errors: error.issues.map(({ path, message }) => ({
    field: path.join('.'),
    message,
  })),
});

// ===============================
// INFERRED TYPES
// ===============================

export type CreateProductData = z.infer<typeof createProductSchema>;

export type UpdateProductData = z.infer<typeof updateProductSchema>;

export type ProductQuery = z.infer<typeof productQuerySchema>;
