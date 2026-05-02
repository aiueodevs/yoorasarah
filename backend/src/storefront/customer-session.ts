import { and, asc, desc, eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { auth } from "../auth";
import { db } from "../db";
import { cartItems, shoppingSessions, user, wishlistItems } from "../db/schema";
import { attachShoppingSessionCookie, getOrCreateShoppingSession, SHOPPING_SESSION_COOKIE } from "./service";

export type CartMergeLine = {
  productId: string;
  colorKey: string;
  size: string;
  quantity: number;
};

export function mergeCartLines(lines: CartMergeLine[]) {
  const merged = new Map<string, CartMergeLine>();

  for (const line of lines) {
    const key = [line.productId, line.colorKey, line.size].join("|");
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      merged.set(key, { ...line });
    }
  }

  return Array.from(merged.values());
}

export function uniqueWishlistProductIds(productIds: string[]) {
  return Array.from(new Set(productIds));
}

type FindUserById = (id: string) => Promise<{ id: string } | null | undefined>;

async function findUserById(id: string) {
  return db.query.user.findFirst({
    where: eq(user.id, id),
    columns: { id: true }
  });
}

export async function resolveAuthenticatedCustomerUserId(sessionUserId: string | null | undefined, lookup: FindUserById = findUserById) {
  if (!sessionUserId) return null;
  const existingUser = await lookup(sessionUserId);
  return existingUser?.id ?? null;
}

async function getAuthenticatedUserId(c: Context) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return resolveAuthenticatedCustomerUserId(session?.user?.id);
}

async function getCurrentShoppingSession(c: Context) {
  const token = getCookie(c, SHOPPING_SESSION_COOKIE);
  if (!token) return null;

  return db.query.shoppingSessions.findFirst({
    where: eq(shoppingSessions.token, token)
  });
}

async function getLatestUserShoppingSession(userId: string) {
  return db.query.shoppingSessions.findFirst({
    where: eq(shoppingSessions.userId, userId),
    orderBy: [desc(shoppingSessions.updatedAt)]
  });
}

async function mergeShoppingSessions(sourceSessionId: string, targetSessionId: string) {
  if (sourceSessionId === targetSessionId) return;

  const [sourceCart, targetCart, sourceWishlist, targetWishlist] = await Promise.all([
    db.query.cartItems.findMany({ where: eq(cartItems.shoppingSessionId, sourceSessionId), orderBy: [asc(cartItems.createdAt)] }),
    db.query.cartItems.findMany({ where: eq(cartItems.shoppingSessionId, targetSessionId), orderBy: [asc(cartItems.createdAt)] }),
    db.query.wishlistItems.findMany({ where: eq(wishlistItems.shoppingSessionId, sourceSessionId), orderBy: [asc(wishlistItems.createdAt)] }),
    db.query.wishlistItems.findMany({ where: eq(wishlistItems.shoppingSessionId, targetSessionId), orderBy: [asc(wishlistItems.createdAt)] })
  ]);

  await db.transaction(async (tx) => {
    const mergedCart = mergeCartLines([
      ...targetCart.map((item) => ({
        productId: item.productId,
        colorKey: item.colorKey,
        size: item.size,
        quantity: item.quantity
      })),
      ...sourceCart.map((item) => ({
        productId: item.productId,
        colorKey: item.colorKey,
        size: item.size,
        quantity: item.quantity
      }))
    ]);

    for (const line of mergedCart) {
      const current = targetCart.find((item) => (
        item.productId === line.productId &&
        item.colorKey === line.colorKey &&
        item.size === line.size
      ));
      const fallback = sourceCart.find((item) => (
        item.productId === line.productId &&
        item.colorKey === line.colorKey &&
        item.size === line.size
      ));

      if (current) {
        await tx.update(cartItems).set({ quantity: line.quantity, updatedAt: new Date() }).where(eq(cartItems.id, current.id));
      } else if (fallback) {
        await tx.insert(cartItems).values({
          shoppingSessionId: targetSessionId,
          productId: fallback.productId,
          colorVariantId: fallback.colorVariantId,
          colorKey: fallback.colorKey,
          colorName: fallback.colorName,
          size: fallback.size,
          quantity: line.quantity,
          unitPrice: fallback.unitPrice,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
    }

    const mergedWishlistIds = uniqueWishlistProductIds([
      ...targetWishlist.map((item) => item.productId),
      ...sourceWishlist.map((item) => item.productId)
    ]);

    for (const productId of mergedWishlistIds) {
      await tx.insert(wishlistItems).values({
        shoppingSessionId: targetSessionId,
        productId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing();
    }

    await tx.delete(shoppingSessions).where(eq(shoppingSessions.id, sourceSessionId));
    await tx.update(shoppingSessions).set({ updatedAt: new Date() }).where(eq(shoppingSessions.id, targetSessionId));
  });
}

export async function attachCustomerShoppingSession(c: Context) {
  const userId = await getAuthenticatedUserId(c);
  if (!userId) return null;

  let currentSession = await getCurrentShoppingSession(c);
  if (currentSession?.userId && currentSession.userId !== userId) {
    currentSession = null;
  }
  const userSession = await getLatestUserShoppingSession(userId);

  if (!currentSession && !userSession) {
    const created = await getOrCreateShoppingSession(c);
    await db.update(shoppingSessions).set({ userId, updatedAt: new Date() }).where(eq(shoppingSessions.id, created.id));
    return { ...created, userId };
  }

  if (currentSession && !userSession) {
    await db.update(shoppingSessions).set({ userId, updatedAt: new Date() }).where(eq(shoppingSessions.id, currentSession.id));
    attachShoppingSessionCookie(c, currentSession.token);
    return { ...currentSession, userId };
  }

  if (!currentSession && userSession) {
    attachShoppingSessionCookie(c, userSession.token);
    return userSession;
  }

  if (currentSession && userSession && currentSession.id !== userSession.id) {
    await mergeShoppingSessions(currentSession.id, userSession.id);
    attachShoppingSessionCookie(c, userSession.token);
    return userSession;
  }

  if (currentSession && currentSession.userId !== userId) {
    await db.update(shoppingSessions).set({ userId, updatedAt: new Date() }).where(and(
      eq(shoppingSessions.id, currentSession.id),
      eq(shoppingSessions.token, currentSession.token)
    ));
  }

  if (currentSession) attachShoppingSessionCookie(c, currentSession.token);
  return currentSession;
}

export async function createFreshGuestShoppingSession(c: Context) {
  const now = new Date();
  const [created] = await db.insert(shoppingSessions).values({
    token: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  }).returning();

  attachShoppingSessionCookie(c, created.token);
  return created;
}
