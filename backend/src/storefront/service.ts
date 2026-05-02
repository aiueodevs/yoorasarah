import { and, asc, count, desc, eq, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { withJsonCache } from "../cache";
import { db } from "../db";
import {
  cartItems,
  categories,
  productColorVariants,
  productImages,
  productVariantStocks,
  products as productsTable,
  shoppingSessions,
  wishlistItems
} from "../db/schema";
import { env } from "../env";
import { searchCacheKey } from "../products/cache-keys";
import { toPublicProduct, type ProductRecord, type PublicProduct } from "../products/presenter";
import { colorKeyForVariant, findStockForSelection, splitProductSizes } from "../products/stock";
import type { CartItemInput, CartUpdateInput, ProductSearchInput } from "./schemas";

export const SHOPPING_SESSION_COOKIE = "ys_store_token";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const publicProductWhere = eq(productsTable.isPublished, true);

export class StorefrontError extends Error {
  constructor(public readonly status: 400 | 404 | 409, message: string) {
    super(message);
  }
}

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

export function attachShoppingSessionCookie(c: Context, token: string) {
  setCookie(c, SHOPPING_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "Lax",
    secure: env.BETTER_AUTH_URL.startsWith("https://")
  });
}

export async function getShoppingSessionFromCookie(c: Context) {
  const currentToken = getCookie(c, SHOPPING_SESSION_COOKIE);
  if (!currentToken) return null;

  const existing = await db.query.shoppingSessions.findFirst({
    where: eq(shoppingSessions.token, currentToken)
  });

  if (existing) {
    await db.update(shoppingSessions).set({ updatedAt: new Date() }).where(eq(shoppingSessions.id, existing.id));
    attachShoppingSessionCookie(c, existing.token);
    return existing;
  }

  return null;
}

export async function getOrCreateShoppingSession(c: Context) {
  const existing = await getShoppingSessionFromCookie(c);
  if (existing) return existing;

  const now = new Date();
  const [created] = await db.insert(shoppingSessions).values({
    token: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  }).returning();

  attachShoppingSessionCookie(c, created.token);
  return created;
}

export type CartResponse = {
  items: Array<{
    id: string;
    productId: string;
    colorVariantId?: string;
    product: PublicProduct;
    color: string;
    size: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalQuantity: number;
  subtotal: number;
};

export type WishlistResponse = {
  items: Array<{
    id: string;
    productId: string;
    product: PublicProduct;
    createdAt: string;
  }>;
  productIds: string[];
  total: number;
};

export type ProductSearchResponse = {
  products: PublicProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  q: string;
  categorySlug: string;
  sort: ProductSearchInput["sort"];
};

export const emptyCartResponse: CartResponse = {
  items: [],
  totalQuantity: 0,
  subtotal: 0
};

export const emptyWishlistResponse: WishlistResponse = {
  items: [],
  productIds: [],
  total: 0
};

function sizeOptions(product: { sizes: string }) {
  return splitProductSizes(product.sizes);
}

function assertProductSize(product: { sizes: string }, size: string) {
  const allowedSizes = sizeOptions(product);
  if (allowedSizes.length > 0 && !allowedSizes.includes(size)) {
    throw new StorefrontError(400, "Ukuran produk tidak valid.");
  }
}

function assertStock(
  product: { name: string; stockVariants?: Array<{ colorVariantId?: string | null; colorName: string; colorKey: string; size: string; stock: number }> },
  input: { colorVariantId?: string | null; colorName: string; size: string },
  quantity: number
) {
  const stock = findStockForSelection(product.stockVariants ?? [], input);
  if (stock < quantity) {
    throw new StorefrontError(409, `Stok ${product.name} tidak cukup.`);
  }
}

function cartColorKey(input: Pick<CartItemInput, "colorName" | "colorVariantId">) {
  return colorKeyForVariant(input);
}

function hasInputField(input: CartUpdateInput, key: keyof CartUpdateInput) {
  return Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined;
}

function toCartResponse(items: Array<typeof cartItems.$inferSelect & { product: unknown }>): CartResponse {
  const visibleItems = items.filter((item) => (item.product as { isPublished?: boolean } | null)?.isPublished !== false);
  const mapped = visibleItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    ...(item.colorVariantId ? { colorVariantId: item.colorVariantId } : {}),
    product: asPublicProduct(item.product),
    color: item.colorName,
    size: item.size,
    qty: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity
  }));

  return {
    items: mapped,
    totalQuantity: mapped.reduce((sum, item) => sum + item.qty, 0),
    subtotal: mapped.reduce((sum, item) => sum + item.lineTotal, 0)
  };
}

export async function getCart(shoppingSessionId: string): Promise<CartResponse> {
  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.shoppingSessionId, shoppingSessionId),
    with: {
      product: {
        with: productWithRelations()
      }
    },
    orderBy: [desc(cartItems.updatedAt)]
  });

  return toCartResponse(items);
}

export async function addCartItem(shoppingSessionId: string, input: CartItemInput): Promise<CartResponse> {
  const product = await db.query.products.findFirst({
    where: and(publicProductWhere, eq(productsTable.id, input.productId)),
    with: productWithRelations()
  });

  if (!product) throw new StorefrontError(404, "Produk tidak ditemukan.");
  assertProductSize(product, input.size);

  const selectedVariant = input.colorVariantId
    ? product.colorVariants.find((variant) => variant.id === input.colorVariantId)
    : undefined;
  if (input.colorVariantId && !selectedVariant) {
    throw new StorefrontError(400, "Warna produk tidak valid.");
  }

  const colorName = selectedVariant?.name ?? input.colorName;
  const colorKey = cartColorKey({ colorName, colorVariantId: input.colorVariantId });
  const existing = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.shoppingSessionId, shoppingSessionId),
      eq(cartItems.productId, product.id),
      eq(cartItems.colorKey, colorKey),
      eq(cartItems.size, input.size)
    )
  });

  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  assertStock(product, { colorVariantId: selectedVariant?.id, colorName, size: input.size }, nextQuantity);

  if (existing) {
    await db.update(cartItems).set({
      quantity: nextQuantity,
      updatedAt: new Date()
    }).where(eq(cartItems.id, existing.id));
  } else {
    const now = new Date();
    await db.insert(cartItems).values({
      shoppingSessionId,
      productId: product.id,
      colorVariantId: selectedVariant?.id ?? null,
      colorKey,
      colorName,
      size: input.size,
      quantity: input.quantity,
      unitPrice: product.price,
      createdAt: now,
      updatedAt: now
    });
  }

  return getCart(shoppingSessionId);
}

export async function updateCartItem(shoppingSessionId: string, cartItemId: string, input: CartUpdateInput): Promise<CartResponse> {
  const item = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.id, cartItemId), eq(cartItems.shoppingSessionId, shoppingSessionId)),
    with: {
      product: {
        with: productWithRelations()
      }
    }
  });

  if (!item) throw new StorefrontError(404, "Item keranjang tidak ditemukan.");
  if (!item.product.isPublished) throw new StorefrontError(404, "Produk tidak ditemukan.");

  const quantity = input.quantity ?? item.quantity;
  const size = input.size ?? item.size;
  assertProductSize(item.product, size);

  const hasColorChange = hasInputField(input, "colorVariantId") || hasInputField(input, "colorName");
  let colorVariantId = item.colorVariantId;
  let colorName = item.colorName;
  let colorKey = item.colorKey;

  if (hasColorChange) {
    const selectedVariant = input.colorVariantId
      ? item.product.colorVariants.find((variant) => variant.id === input.colorVariantId)
      : undefined;
    if (input.colorVariantId && !selectedVariant) {
      throw new StorefrontError(400, "Warna produk tidak valid.");
    }

    colorVariantId = selectedVariant?.id ?? null;
    colorName = selectedVariant?.name ?? input.colorName ?? "";
    if (!colorName) throw new StorefrontError(400, "Warna produk tidak valid.");
    colorKey = cartColorKey({ colorName, colorVariantId: colorVariantId ?? undefined });
  }

  const matchingItem = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.shoppingSessionId, shoppingSessionId),
      eq(cartItems.productId, item.productId),
      eq(cartItems.colorKey, colorKey),
      eq(cartItems.size, size)
    )
  });

  if (matchingItem && matchingItem.id !== item.id) {
    const mergedQuantity = matchingItem.quantity + quantity;
    assertStock(item.product, { colorVariantId, colorName, size }, mergedQuantity);

    await db.update(cartItems).set({
      quantity: mergedQuantity,
      updatedAt: new Date()
    }).where(eq(cartItems.id, matchingItem.id));
    await db.delete(cartItems).where(eq(cartItems.id, item.id));

    return getCart(shoppingSessionId);
  }

  assertStock(item.product, { colorVariantId, colorName, size }, quantity);

  await db.update(cartItems).set({
    colorVariantId,
    colorKey,
    colorName,
    size,
    quantity,
    updatedAt: new Date()
  }).where(eq(cartItems.id, item.id));

  return getCart(shoppingSessionId);
}

export async function removeCartItem(shoppingSessionId: string, cartItemId: string): Promise<CartResponse> {
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.shoppingSessionId, shoppingSessionId)));
  return getCart(shoppingSessionId);
}

export async function clearCart(shoppingSessionId: string): Promise<CartResponse> {
  await db.delete(cartItems).where(eq(cartItems.shoppingSessionId, shoppingSessionId));
  return getCart(shoppingSessionId);
}

function toWishlistResponse(items: Array<typeof wishlistItems.$inferSelect & { product: unknown }>): WishlistResponse {
  const mapped = items
    .filter((item) => (item.product as { isPublished?: boolean } | null)?.isPublished !== false)
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      product: asPublicProduct(item.product),
      createdAt: item.createdAt.toISOString()
    }));

  return {
    items: mapped,
    productIds: mapped.map((item) => item.productId),
    total: mapped.length
  };
}

export async function getWishlist(shoppingSessionId: string): Promise<WishlistResponse> {
  const items = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.shoppingSessionId, shoppingSessionId),
    with: {
      product: {
        with: productWithRelations()
      }
    },
    orderBy: [desc(wishlistItems.createdAt)]
  });

  return toWishlistResponse(items);
}

export async function addWishlistItem(shoppingSessionId: string, productId: string): Promise<WishlistResponse> {
  const product = await db.query.products.findFirst({
    where: and(publicProductWhere, eq(productsTable.id, productId))
  });

  if (!product) throw new StorefrontError(404, "Produk tidak ditemukan.");

  const now = new Date();
  await db.insert(wishlistItems).values({
    shoppingSessionId,
    productId,
    createdAt: now,
    updatedAt: now
  }).onConflictDoNothing();

  return getWishlist(shoppingSessionId);
}

export async function removeWishlistItem(shoppingSessionId: string, productId: string): Promise<WishlistResponse> {
  await db.delete(wishlistItems).where(and(
    eq(wishlistItems.shoppingSessionId, shoppingSessionId),
    eq(wishlistItems.productId, productId)
  ));

  return getWishlist(shoppingSessionId);
}

function searchWhere(normalizedQuery: string, normalizedCategory: string) {
  const conditions = [publicProductWhere];
  if (normalizedCategory) conditions.push(eq(categories.slug, normalizedCategory));
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    conditions.push(or(
      ilike(productsTable.name, pattern),
      ilike(categories.name, pattern),
      ilike(categories.slug, pattern),
      sql`coalesce(${productsTable.description}::text, '') ilike ${pattern}`,
      sql`coalesce(${productsTable.materials}::text, '') ilike ${pattern}`,
      sql`coalesce(${productsTable.care}::text, '') ilike ${pattern}`,
      sql`exists (
        select 1 from "ProductColorVariant" pcv
        where pcv."productId" = ${productsTable.id}
        and pcv."name" ilike ${pattern}
      )`
    )!);
  }

  return and(...conditions);
}

function searchOrder(sort: ProductSearchInput["sort"]) {
  if (sort === "price-asc") return [asc(productsTable.price), desc(productsTable.publishedAt)];
  if (sort === "price-desc") return [desc(productsTable.price), desc(productsTable.publishedAt)];
  if (sort === "best-seller") return [desc(productsTable.isBestSeller), desc(productsTable.salesCount), desc(productsTable.publishedAt)];
  return [desc(productsTable.publishedAt), desc(productsTable.createdAt)];
}

export async function searchProducts(input: ProductSearchInput): Promise<ProductSearchResponse> {
  const key = searchCacheKey(input);
  return withJsonCache(key, async () => {
    const normalizedQuery = (input.q ?? "").trim().toLowerCase();
    const normalizedCategory = (input.categorySlug ?? "").trim().replace(/^\/+/, "");
    const where = searchWhere(normalizedQuery, normalizedCategory);
    const start = (input.page - 1) * input.limit;

    const [totalRow] = await db
      .select({ total: count(productsTable.id) })
      .from(productsTable)
      .innerJoin(categories, eq(productsTable.categoryId, categories.id))
      .where(where);

    const idRows = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .innerJoin(categories, eq(productsTable.categoryId, categories.id))
      .where(where)
      .orderBy(...searchOrder(input.sort))
      .limit(input.limit)
      .offset(start);

    const ids = idRows.map((row) => row.id);
    const products = ids.length
      ? await db.query.products.findMany({
        where: inArray(productsTable.id, ids),
        with: productWithRelations()
      })
      : [];
    const productById = new Map((products as ProductRecord[]).map((product) => [product.id, product]));
    const paged = ids.map((id) => productById.get(id)).filter(Boolean) as ProductRecord[];
    const total = totalRow?.total ?? 0;

    return {
      products: paged.map(asPublicProduct),
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
      q: input.q ?? "",
      categorySlug: normalizedCategory,
      sort: input.sort
    };
  });
}

export async function cleanupOldGuestShoppingSessions(olderThan = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)) {
  await db.delete(shoppingSessions).where(and(
    isNull(shoppingSessions.userId),
    lte(shoppingSessions.updatedAt, olderThan),
    sql`not exists (select 1 from "CartItem" ci where ci."shoppingSessionId" = ${shoppingSessions.id})`,
    sql`not exists (select 1 from "WishlistItem" wi where wi."shoppingSessionId" = ${shoppingSessions.id})`
  ));
}
