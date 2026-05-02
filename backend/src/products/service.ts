import { and, asc, count, desc, eq, isNull, or } from "drizzle-orm";
import { deleteCacheKeys, deleteCachePattern, withJsonCache } from "../cache";
import { db } from "../db";
import {
  categories,
  productColorVariants,
  productImages,
  productVariantStocks,
  products as productsTable,
  type Product
} from "../db/schema";
import { cacheKeysForProductChange, categoryProductsCacheKey, detailCacheKey, publicCacheKeys, searchCachePattern } from "./cache-keys";
import { toPublicProduct, type ProductRecord } from "./presenter";
import { categorySlugFromPath, leafSlugFromPath, parsePriceToAmount, slugify } from "./slug";
import type { CreateProductInput, ProductMutationInput } from "./schemas";
import { buildEvenStockVariants, colorKeyForVariant, totalStock, type NormalizedStockVariant, type StockVariantInput } from "./stock";
import { deleteProductImageFiles } from "../uploads/supabase";

const publicProductWhere = eq(productsTable.isPublished, true);

export function isBestSellerCollectionProduct(product: Pick<Product, "isPublished" | "isBestSeller" | "salesCount">) {
  return product.isPublished && product.isBestSeller;
}

export type PublicCategory = {
  name: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  countLabel: string;
  productCount: number;
};

function productWithRelations() {
  return {
    category: true as const,
    images: {
      where: isNull(productImages.colorVariantId),
      orderBy: [asc(productImages.displayOrder)]
    },
    colorVariants: {
      orderBy: [asc(productColorVariants.displayOrder)],
      with: {
        images: {
          orderBy: [asc(productImages.displayOrder)]
        }
      }
    },
    stockVariants: {
      orderBy: [asc(productVariantStocks.displayOrder)]
    }
  };
}

function asPublicProduct(product: unknown) {
  return toPublicProduct(product as ProductRecord);
}

function asAdminProduct(product: unknown) {
  const record = product as ProductRecord & { id: string; isPublished: boolean; createdAt: Date; updatedAt: Date };
  return {
    ...toPublicProduct(record),
    isPublished: record.isPublished,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function toCategoryResponse(category: { name: string; slug: string; title: string; description: string | null; productCount?: number }): PublicCategory {
  const productCount = category.productCount ?? 0;
  return {
    name: category.name,
    slug: category.slug,
    href: `/${category.slug}`,
    title: category.title,
    description: category.description ?? "",
    countLabel: `${productCount} Produk`,
    productCount
  };
}

export async function listProducts() {
  return withJsonCache(publicCacheKeys.products, async () => {
    const products = await db.query.products.findMany({
      where: publicProductWhere,
      with: productWithRelations(),
      orderBy: [desc(productsTable.publishedAt), desc(productsTable.createdAt)]
    });

    return products.map(asPublicProduct);
  });
}

export async function getProduct(slugOrPath: string) {
  const decoded = decodeURIComponent(slugOrPath);
  const normalizedPath = decoded.startsWith("/") ? decoded : `/${decoded}`;
  const leafSlug = leafSlugFromPath(decoded);

  return withJsonCache(detailCacheKey(decoded), async () => {
    const product = await db.query.products.findFirst({
      where: and(
        publicProductWhere,
        or(
          eq(productsTable.slug, leafSlug),
          eq(productsTable.path, normalizedPath),
          eq(productsTable.path, decoded)
        )
      ),
      with: productWithRelations()
    });

    return product ? asPublicProduct(product) : null;
  });
}

export async function listCategories() {
  return withJsonCache(publicCacheKeys.categories, async () => {
    const rows = await db
      .select({
        name: categories.name,
        slug: categories.slug,
        title: categories.title,
        description: categories.description,
        productCount: count(productsTable.id)
      })
      .from(categories)
      .leftJoin(productsTable, and(eq(productsTable.categoryId, categories.id), publicProductWhere))
      .groupBy(categories.id, categories.name, categories.slug, categories.title, categories.description, categories.sortOrder)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    return rows.map(toCategoryResponse);
  });
}

export async function listCategoryProducts(categorySlug: string) {
  const slug = categorySlug.replace(/^\/+/, "");

  return withJsonCache(categoryProductsCacheKey(slug), async () => {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: {
        products: {
          where: publicProductWhere,
          with: productWithRelations(),
          orderBy: [desc(productsTable.publishedAt), desc(productsTable.createdAt)]
        }
      }
    });

    if (!category) return null;

    return {
      category: toCategoryResponse({
        name: category.name,
        slug: category.slug,
        title: category.title,
        description: category.description,
        productCount: category.products.length
      }),
      products: category.products.map(asPublicProduct)
    };
  });
}

export async function listNewArrivalProducts() {
  return withJsonCache(publicCacheKeys.newArrival, async () => {
    const products = await db.query.products.findMany({
      where: publicProductWhere,
      with: productWithRelations(),
      orderBy: [desc(productsTable.publishedAt), desc(productsTable.createdAt)]
    });

    return products.map(asPublicProduct);
  });
}

export async function listBestSellerProducts() {
  return withJsonCache(publicCacheKeys.bestSeller, async () => {
    const products = await db.query.products.findMany({
      where: and(
        publicProductWhere,
        eq(productsTable.isBestSeller, true)
      ),
      with: productWithRelations(),
      orderBy: [desc(productsTable.salesCount), desc(productsTable.publishedAt)]
    });

    return products.map(asPublicProduct);
  });
}

export async function listAdminProducts() {
  const products = await db.query.products.findMany({
    with: productWithRelations(),
    orderBy: [desc(productsTable.updatedAt)]
  });

  return products.map(asAdminProduct);
}

export async function getAdminProduct(id: string) {
  const product = await getProductById(db, id);
  return product ? asAdminProduct(product) : null;
}

export async function createProduct(input: CreateProductInput) {
  const product = await db.transaction(async (tx) => {
    const category = await upsertCategory(tx, input.categorySlug, input.categoryName);
    const leafSlug = slugify(input.slug ?? input.name);
    const now = new Date();
    const [created] = await tx.insert(productsTable).values({
      name: input.name,
      slug: leafSlug,
      path: `/${category.slug}/${leafSlug}`,
      categoryId: category.id,
      price: parsePriceToAmount(input.price),
      colorCount: input.colorCount ?? input.colorVariants?.length ?? 0,
      sizes: input.sizes,
      stock: input.stock ?? 0,
      badge: input.badge ?? null,
      isBestSeller: input.isBestSeller ?? false,
      salesCount: input.salesCount ?? 0,
      isPublished: input.isPublished ?? true,
      publishedAt: input.publishedAt ?? new Date(),
      description: input.description,
      materials: input.materials,
      care: input.care,
      createdAt: now,
      updatedAt: now
    }).returning();

    const createdVariants = await replaceProductMedia(tx, created.id, input);
    await replaceProductStock(tx, created.id, {
      stockVariants: input.stockVariants,
      fallbackTotalStock: input.stock ?? 0,
      sizes: input.sizes,
      colorVariants: createdVariants
    });
    return getProductById(tx, created.id);
  });

  await invalidateProduct(product);
  return asAdminProduct(product);
}

export async function updateProduct(id: string, input: ProductMutationInput) {
  const before = await getProductById(db, id);

  const product = await db.transaction(async (tx) => {
    const existing = await tx.query.products.findFirst({
      where: eq(productsTable.id, id),
      with: { category: true }
    });

    if (!existing) return null;

    const category = input.categorySlug ? await upsertCategory(tx, input.categorySlug, input.categoryName) : undefined;
    const leafSlug = input.slug ? slugify(input.slug) : existing.slug;
    const categorySlug = category?.slug ?? existing.category.slug;
    const changes: Partial<typeof productsTable.$inferInsert> = {
      updatedAt: new Date()
    };

    if (input.name !== undefined) changes.name = input.name;
    if (input.slug !== undefined || input.categorySlug !== undefined) {
      changes.slug = leafSlug;
      changes.path = `/${categorySlug}/${leafSlug}`;
    }
    if (category) changes.categoryId = category.id;
    if (input.price !== undefined) changes.price = parsePriceToAmount(input.price);
    if (input.colorCount !== undefined) changes.colorCount = input.colorCount;
    if (input.sizes !== undefined) changes.sizes = input.sizes;
    if (input.stock !== undefined) changes.stock = input.stock;
    if (input.badge !== undefined) changes.badge = input.badge;
    if (input.isBestSeller !== undefined) changes.isBestSeller = input.isBestSeller;
    if (input.salesCount !== undefined) changes.salesCount = input.salesCount;
    if (input.isPublished !== undefined) changes.isPublished = input.isPublished;
    if (input.publishedAt !== undefined) changes.publishedAt = input.publishedAt;
    if (input.description !== undefined) changes.description = input.description;
    if (input.materials !== undefined) changes.materials = input.materials;
    if (input.care !== undefined) changes.care = input.care;

    await tx.update(productsTable).set(changes).where(eq(productsTable.id, id));

    const updatedVariants = input.images || input.colorVariants
      ? await replaceProductMedia(tx, id, input)
      : await getProductColorVariants(tx, id);

    if (input.stockVariants || input.stock !== undefined || input.sizes !== undefined || input.colorVariants !== undefined) {
      await replaceProductStock(tx, id, {
        stockVariants: input.stockVariants,
        fallbackTotalStock: input.stock ?? existing.stock,
        sizes: input.sizes ?? existing.sizes,
        colorVariants: updatedVariants
      });
    }

    return getProductById(tx, id);
  });

  if (!product) return null;

  await invalidateProduct(before);
  await invalidateProduct(product);
  await deleteProductImageFiles(removedStoragePaths(before, product));
  return asAdminProduct(product);
}

export async function deleteProduct(id: string) {
  const product = await getProductById(db, id);
  if (!product) return false;

  await db.delete(productsTable).where(eq(productsTable.id, id));
  await invalidateProduct(product);
  await deleteProductImageFiles(storagePathsForProduct(product));
  return true;
}

export async function updateProductStock(id: string, stockVariants: StockVariantInput[]) {
  const before = await getProductById(db, id);
  if (!before) return null;

  const product = await db.transaction(async (tx) => {
    const colorVariants = await getProductColorVariants(tx, id);
    await replaceProductStock(tx, id, {
      stockVariants,
      fallbackTotalStock: before.stock,
      sizes: before.sizes,
      colorVariants
    });
    return getProductById(tx, id);
  });
  if (!product) throw new Error(`Product ${id} not found after stock update`);

  await invalidateProduct(before);
  await invalidateProduct(product);
  return asAdminProduct(product);
}

async function upsertCategory(tx: any, rawSlug: string, name?: string) {
  const slug = slugify(rawSlug);
  const title = name ?? titleFromSlug(slug);
  const now = new Date();
  const [category] = await tx
    .insert(categories)
    .values({
      slug,
      name: title,
      title,
      description: defaultCategoryDescription(slug),
      sortOrder: defaultCategoryOrder(slug),
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        ...(name ? { name, title: name } : {}),
        updatedAt: now
      }
    })
    .returning();

  return category;
}

async function replaceProductMedia(tx: any, productId: string, input: Pick<ProductMutationInput, "images" | "colorVariants">) {
  if (input.images !== undefined) {
    await tx.delete(productImages).where(and(eq(productImages.productId, productId), isNull(productImages.colorVariantId)));

    for (const image of input.images) {
      const now = new Date();
      await tx.insert(productImages).values({
        productId,
        storagePath: image.storagePath ?? null,
        publicUrl: image.publicUrl,
        alt: image.alt ?? null,
        displayOrder: image.displayOrder,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  if (input.colorVariants === undefined) {
    return getProductColorVariants(tx, productId);
  }

  await tx.delete(productColorVariants).where(eq(productColorVariants.productId, productId));

  const createdVariants: Array<{ id: string; name: string; displayOrder: number }> = [];
  for (const variant of input.colorVariants) {
    const now = new Date();
    const [createdVariant] = await tx.insert(productColorVariants).values({
      productId,
      name: variant.name,
      hex: variant.hex,
      displayOrder: variant.displayOrder,
      createdAt: now,
      updatedAt: now
    }).returning();
    createdVariants.push({
      id: createdVariant.id,
      name: createdVariant.name,
      displayOrder: createdVariant.displayOrder
    });

    for (const image of variant.images) {
      const imageNow = new Date();
      await tx.insert(productImages).values({
        productId,
        colorVariantId: createdVariant.id,
        storagePath: image.storagePath ?? null,
        publicUrl: image.publicUrl,
        alt: image.alt ?? `${variant.name} image`,
        displayOrder: image.displayOrder,
        createdAt: imageNow,
        updatedAt: imageNow
      });
    }
  }

  return createdVariants;
}

async function getProductColorVariants(tx: any, productId: string) {
  return tx.query.productColorVariants.findMany({
    where: eq(productColorVariants.productId, productId),
    orderBy: [asc(productColorVariants.displayOrder)]
  });
}

async function replaceProductStock(
  tx: any,
  productId: string,
  input: {
    stockVariants?: StockVariantInput[];
    fallbackTotalStock: number;
    sizes: string;
    colorVariants: Array<{ id?: string | null; name: string; displayOrder?: number }>;
  }
) {
  const rows = input.stockVariants?.length
    ? normalizeStockRows(input.stockVariants, input.colorVariants)
    : buildEvenStockVariants({
      totalStock: input.fallbackTotalStock,
      sizes: input.sizes,
      colorVariants: input.colorVariants
    });
  const total = totalStock(rows);
  const now = new Date();

  await tx.delete(productVariantStocks).where(eq(productVariantStocks.productId, productId));

  if (rows.length) {
    await tx.insert(productVariantStocks).values(rows.map((row) => ({
      productId,
      colorVariantId: row.colorVariantId,
      colorName: row.colorName,
      colorKey: row.colorKey,
      size: row.size,
      stock: row.stock,
      displayOrder: row.displayOrder,
      createdAt: now,
      updatedAt: now
    })));
  }

  await tx.update(productsTable).set({ stock: total, updatedAt: now }).where(eq(productsTable.id, productId));
}

function normalizeStockRows(
  rows: StockVariantInput[],
  colorVariants: Array<{ id?: string | null; name: string; displayOrder?: number }>
): NormalizedStockVariant[] {
  const variantById = new Map(colorVariants.filter((variant) => variant.id).map((variant) => [variant.id, variant]));
  const variantByName = new Map(colorVariants.map((variant) => [variant.name.trim().toLowerCase(), variant]));
  return rows.map((row, index) => {
    const matchedVariant = (row.colorVariantId ? variantById.get(row.colorVariantId) : undefined)
      ?? variantByName.get(row.colorName.trim().toLowerCase());
    const colorVariantId = matchedVariant?.id ?? null;
    const colorName = matchedVariant?.name ?? row.colorName.trim();

    return {
      colorVariantId,
      colorName,
      colorKey: colorKeyForVariant({ colorVariantId, colorName }),
      size: row.size.trim(),
      stock: Math.max(0, Math.floor(row.stock)),
      displayOrder: row.displayOrder ?? index
    };
  });
}

async function getProductById(client: any, id: string) {
  return client.query.products.findFirst({
    where: eq(productsTable.id, id),
    with: productWithRelations()
  });
}

async function invalidateProduct(product: ({ path: string; category?: { slug: string } | null }) | null) {
  if (!product) {
    await deleteCacheKeys(Object.values(publicCacheKeys));
    await deleteCachePattern(searchCachePattern);
    return;
  }

  await deleteCacheKeys(cacheKeysForProductChange({
    path: product.path,
    categorySlug: product.category?.slug ?? categorySlugFromPath(product.path)
  }));
  await deleteCachePattern(searchCachePattern);
}

function storagePathsForProduct(product: unknown) {
  const record = product as ProductRecord | null | undefined;
  const paths: string[] = [];
  for (const image of record?.images ?? []) {
    if (image.storagePath) paths.push(image.storagePath);
  }
  for (const variant of record?.colorVariants ?? []) {
    for (const image of variant.images ?? []) {
      if (image.storagePath) paths.push(image.storagePath);
    }
  }
  return Array.from(new Set(paths));
}

function removedStoragePaths(before: unknown, after: unknown) {
  const afterPaths = new Set(storagePathsForProduct(after));
  return storagePathsForProduct(before).filter((path) => !afterPaths.has(path));
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter((part) => !/^\d+$/.test(part))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultCategoryDescription(slug: string) {
  const descriptions: Record<string, string> = {
    produk: "Seluruh pilihan Yoora Sarah dalam satu katalog lengkap.",
    dress: "Setiap dress memiliki ceritanya.",
    "abaya-2481": "Layer formal dengan jatuh kain yang tenang.",
    "hijab-1544": "Pilihan hijab yang rapi untuk setiap hari.",
    "khimar-5295": "Coverage panjang dengan tampilan yang anggun.",
    "pashmina-2310": "Pashmina ringan yang mudah dipadukan.",
    "kids-9967": "Busana manis untuk momen si kecil.",
    "footwear-8675": "Pelengkap tampilan yang tetap nyaman dipakai.",
    "accessories-4472": "Detail kecil yang membuat look terasa selesai.",
    "essentials-7002": "Produk dasar untuk layering sehari-hari.",
    "one-set-5182": "Set lengkap yang memudahkan styling."
  };

  return descriptions[slug] ?? "";
}

function defaultCategoryOrder(slug: string) {
  const order = ["produk", "best-seller", "terbaru", "dress", "abaya-2481", "hijab-1544", "khimar-5295", "pashmina-2310", "kids-9967", "footwear-8675", "accessories-4472", "essentials-7002", "one-set-5182"];
  const index = order.indexOf(slug);
  return index === -1 ? 100 : index;
}
