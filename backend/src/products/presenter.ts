export type ProductImageRecord = {
  publicUrl: string;
  storagePath?: string | null;
  alt?: string | null;
  displayOrder: number;
};

export type ProductColorVariantRecord = {
  id?: string;
  name: string;
  hex: string;
  displayOrder: number;
  images?: ProductImageRecord[];
};

export type ProductVariantStockRecord = {
  colorVariantId?: string | null;
  colorName: string;
  colorKey: string;
  size: string;
  stock: number;
  displayOrder: number;
};

export type ProductRecord = {
  id?: string;
  name: string;
  slug: string;
  path: string;
  price: number;
  colorCount: number;
  sizes: string;
  stock: number;
  badge?: string | null;
  isBestSeller: boolean;
  salesCount: number;
  publishedAt: Date;
  category: {
    name: string;
    slug: string;
    description?: string | null;
  };
  images?: ProductImageRecord[];
  colorVariants?: ProductColorVariantRecord[];
  stockVariants?: ProductVariantStockRecord[];
  description?: unknown;
  materials?: unknown;
  care?: unknown;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  leafSlug: string;
  category: string;
  categorySlug: string;
  price: string;
  priceAmount: number;
  image: string;
  colors: number;
  colorVariants?: Array<{ id?: string; name: string; hex: string; gallery: string[] }>;
  stockVariants: Array<{ colorVariantId?: string; colorName: string; colorKey: string; size: string; stock: number }>;
  sizes: string;
  stock: number;
  badge?: string;
  gallery?: string[];
  description?: string[];
  materials?: string[];
  care?: string[];
  salesCount: number;
  isBestSeller: boolean;
  publishedAt: string;
};

export function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function sortImages(images: ProductImageRecord[] = []) {
  return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length ? items : undefined;
}

export function toPublicProduct(product: ProductRecord): PublicProduct {
  const images = sortImages(product.images);
  const gallery = images.map((image) => image.publicUrl);
  const image = gallery[0] ?? "";
  const colorVariants = [...(product.colorVariants ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((variant) => {
      const variantGallery = sortImages(variant.images).map((variantImage) => variantImage.publicUrl);
      return {
        ...(variant.id ? { id: variant.id } : {}),
        name: variant.name,
        hex: variant.hex,
        gallery: variantGallery.length ? variantGallery : gallery
      };
    });
  const stockVariants = [...(product.stockVariants ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((variant) => ({
      ...(variant.colorVariantId ? { colorVariantId: variant.colorVariantId } : {}),
      colorName: variant.colorName,
      colorKey: variant.colorKey,
      size: variant.size,
      stock: variant.stock
    }));

  return {
    id: product.id ?? product.slug,
    name: product.name,
    slug: product.path,
    leafSlug: product.slug,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: formatRupiah(product.price),
    priceAmount: product.price,
    image,
    colors: colorVariants.length || product.colorCount,
    colorVariants: colorVariants.length ? colorVariants : undefined,
    stockVariants,
    sizes: product.sizes,
    stock: product.stock,
    badge: product.isBestSeller ? "Best Seller" : product.badge ?? undefined,
    gallery: gallery.length ? gallery : undefined,
    description: asStringArray(product.description),
    materials: asStringArray(product.materials),
    care: asStringArray(product.care),
    salesCount: product.salesCount,
    isBestSeller: product.isBestSeller,
    publishedAt: product.publishedAt.toISOString()
  };
}
