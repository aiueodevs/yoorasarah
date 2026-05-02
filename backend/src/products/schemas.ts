import { z } from "zod";
import { isAllowedStoragePublicUrl } from "../env";

const imageSchema = z.object({
  storagePath: z.string().max(240).optional().nullable(),
  publicUrl: z.string().url().refine(isAllowedStoragePublicUrl, "Image URL must come from configured storage origins."),
  alt: z.string().trim().max(160).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0)
});

const trimmedText = z.string().trim().min(1).max(120);
const optionalTrimmedText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).max(120).optional()
).optional();
const textListSchema = z.array(z.string().trim().min(1).max(300)).max(20);

const colorVariantSchema = z.object({
  id: optionalTrimmedText,
  name: z.string().trim().min(1).max(80),
  hex: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Hex color must be #RGB or #RRGGBB."),
  displayOrder: z.coerce.number().int().min(0).default(0),
  images: z.array(imageSchema).max(12).default([])
});

const stockVariantSchema = z.object({
  colorVariantId: optionalTrimmedText,
  colorName: trimmedText,
  colorKey: optionalTrimmedText,
  size: trimmedText,
  stock: z.coerce.number().int().min(0),
  displayOrder: z.coerce.number().int().min(0).default(0)
});

export const productMutationSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(100).optional(),
  categorySlug: z.string().trim().min(1).max(100).optional(),
  categoryName: z.string().trim().min(1).max(100).optional(),
  price: z.union([z.coerce.number().int().min(0), z.string().trim().min(1).max(20)]).optional(),
  colorCount: z.coerce.number().int().min(0).max(20).optional(),
  sizes: z.string().trim().min(1).max(120).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  badge: z.string().trim().max(40).optional().nullable(),
  isBestSeller: z.coerce.boolean().optional(),
  salesCount: z.coerce.number().int().min(0).optional(),
  isPublished: z.coerce.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  description: textListSchema.optional(),
  materials: textListSchema.optional(),
  care: textListSchema.optional(),
  images: z.array(imageSchema).max(12).optional(),
  colorVariants: z.array(colorVariantSchema).max(20).optional(),
  stockVariants: z.array(stockVariantSchema).max(200).optional()
});

export const createProductSchema = productMutationSchema.extend({
  name: z.string().trim().min(1).max(120),
  categorySlug: z.string().trim().min(1).max(100),
  price: z.union([z.coerce.number().int().min(0), z.string().trim().min(1).max(20)]),
  sizes: z.string().trim().min(1).max(120)
});

export const stockSchema = z.object({
  stockVariants: z.array(stockVariantSchema).max(200)
});

export type ProductMutationInput = z.infer<typeof productMutationSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
