import { z } from "zod";

const trimmedText = z.string().trim().min(1);
const optionalTrimmedText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
).optional();

export const cartItemSchema = z.object({
  productId: trimmedText,
  colorVariantId: optionalTrimmedText,
  colorName: trimmedText,
  size: trimmedText,
  quantity: z.coerce.number().int().min(1).max(99)
});

export const cartQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99)
});

export const cartUpdateSchema = z.object({
  colorVariantId: optionalTrimmedText,
  colorName: optionalTrimmedText,
  size: optionalTrimmedText,
  quantity: z.coerce.number().int().min(1).max(99).optional()
}).refine((input) => Object.values(input).some((value) => value !== undefined), {
  message: "Minimal satu field cart harus diubah."
});

export const wishlistItemSchema = z.object({
  productId: trimmedText
});

export const productSearchSchema = z.object({
  q: z.string().trim().max(80).optional(),
  categorySlug: z.string().trim().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "best-seller"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24)
});

export const customerEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email()
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CartQuantityInput = z.infer<typeof cartQuantitySchema>;
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;
export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type CustomerEmailInput = z.infer<typeof customerEmailSchema>;
