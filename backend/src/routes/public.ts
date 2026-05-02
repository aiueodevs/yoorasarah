import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { getCookie } from "hono/cookie";
import {
  getProduct,
  listBestSellerProducts,
  listCategories,
  listCategoryProducts,
  listNewArrivalProducts,
  listProducts
} from "../products/service";
import { auth } from "../auth";
import { attachCustomerShoppingSession, createFreshGuestShoppingSession } from "../storefront/customer-session";
import { cartItemSchema, cartUpdateSchema, productSearchSchema, wishlistItemSchema } from "../storefront/schemas";
import { assertRateLimit, rateLimitRequestIp } from "../rate-limit";
import { getRequestIp } from "../request-ip";
import {
  addCartItem,
  addWishlistItem,
  clearCart,
  emptyCartResponse,
  emptyWishlistResponse,
  getCart,
  getOrCreateShoppingSession,
  getShoppingSessionFromCookie,
  getWishlist,
  removeCartItem,
  removeWishlistItem,
  SHOPPING_SESSION_COOKIE,
  searchProducts,
  StorefrontError,
  updateCartItem
} from "../storefront/service";

export const publicRoutes = new Hono();

function handleStorefrontError(error: unknown) {
  if (error instanceof StorefrontError) {
    return { message: error.message, status: error.status };
  }
  throw error;
}

publicRoutes.get("/health", (c) => c.json({ ok: true, service: "yoorasarah-backend" }));

publicRoutes.get("/api/products", async (c) => {
  const products = await listProducts();
  return c.json({ data: products });
});

publicRoutes.get("/api/search/products", zValidator("query", productSearchSchema), async (c) => {
  await rateLimitRequestIp(c, "search", 60, 60);
  const result = await searchProducts(c.req.valid("query"));
  return c.json({ data: result });
});

publicRoutes.get("/api/products/:slug", async (c) => {
  const product = await getProduct(c.req.param("slug"));
  if (!product) return c.json({ message: "Product not found" }, 404);
  return c.json({ data: product });
});

publicRoutes.get("/api/categories", async (c) => {
  const categories = await listCategories();
  return c.json({ data: categories });
});

publicRoutes.get("/api/categories/:slug/products", async (c) => {
  const result = await listCategoryProducts(c.req.param("slug"));
  if (!result) return c.json({ message: "Category not found" }, 404);
  return c.json({ data: result });
});

publicRoutes.get("/api/collections/new-arrival", async (c) => {
  const products = await listNewArrivalProducts();
  return c.json({ data: products });
});

publicRoutes.get("/api/collections/best-seller", async (c) => {
  const products = await listBestSellerProducts();
  return c.json({ data: products });
});

publicRoutes.get("/api/customer/me", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ data: null });

  const shoppingSession = await attachCustomerShoppingSession(c);
  return c.json({
    data: {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image
      },
      shoppingSessionId: shoppingSession?.id ?? null
    }
  });
});

publicRoutes.post("/api/customer/session/attach", async (c) => {
  const shoppingSession = await attachCustomerShoppingSession(c);
  if (!shoppingSession) return c.json({ message: "Unauthorized" }, 401);
  return c.json({ data: { shoppingSessionId: shoppingSession.id } });
});

publicRoutes.post("/api/customer/session/guest", async (c) => {
  await rateLimitRequestIp(c, "session-create", 30, 60 * 60);
  const shoppingSession = await createFreshGuestShoppingSession(c);
  return c.json({ data: { shoppingSessionId: shoppingSession.id } });
});

async function rateLimitSessionCreationIfMissing(c: Context) {
  if (!getCookie(c, SHOPPING_SESSION_COOKIE)) {
    await rateLimitRequestIp(c, "session-create", 30, 60 * 60);
  }
}

async function getShoppingSessionForMutation(c: Context) {
  await rateLimitSessionCreationIfMissing(c);
  const session = await getOrCreateShoppingSession(c);
  await assertRateLimit({
    key: `store-mutation:session:${session.id}:ip:${getRequestIp(c.req.raw)}`,
    limit: 120,
    windowSeconds: 60
  });
  return session;
}

publicRoutes.get("/api/cart", async (c) => {
  const session = await getShoppingSessionFromCookie(c);
  if (!session) return c.json({ data: emptyCartResponse });
  const cart = await getCart(session.id);
  return c.json({ data: cart });
});

publicRoutes.post("/api/cart/items", zValidator("json", cartItemSchema), async (c) => {
  try {
    const session = await getShoppingSessionForMutation(c);
    const cart = await addCartItem(session.id, c.req.valid("json"));
    return c.json({ data: cart }, 201);
  } catch (error) {
    const handled = handleStorefrontError(error);
    return c.json({ message: handled.message }, handled.status);
  }
});

publicRoutes.patch("/api/cart/items/:id", zValidator("json", cartUpdateSchema), async (c) => {
  try {
    const session = await getShoppingSessionForMutation(c);
    const cart = await updateCartItem(session.id, c.req.param("id"), c.req.valid("json"));
    return c.json({ data: cart });
  } catch (error) {
    const handled = handleStorefrontError(error);
    return c.json({ message: handled.message }, handled.status);
  }
});

publicRoutes.delete("/api/cart/items/:id", async (c) => {
  const session = await getShoppingSessionForMutation(c);
  const cart = await removeCartItem(session.id, c.req.param("id"));
  return c.json({ data: cart });
});

publicRoutes.delete("/api/cart", async (c) => {
  const session = await getShoppingSessionForMutation(c);
  const cart = await clearCart(session.id);
  return c.json({ data: cart });
});

publicRoutes.get("/api/wishlist", async (c) => {
  const session = await getShoppingSessionFromCookie(c);
  if (!session) return c.json({ data: emptyWishlistResponse });
  const wishlist = await getWishlist(session.id);
  return c.json({ data: wishlist });
});

publicRoutes.post("/api/wishlist/items", zValidator("json", wishlistItemSchema), async (c) => {
  try {
    const session = await getShoppingSessionForMutation(c);
    const wishlist = await addWishlistItem(session.id, c.req.valid("json").productId);
    return c.json({ data: wishlist }, 201);
  } catch (error) {
    const handled = handleStorefrontError(error);
    return c.json({ message: handled.message }, handled.status);
  }
});

publicRoutes.delete("/api/wishlist/items/:productId", async (c) => {
  const session = await getShoppingSessionForMutation(c);
  const wishlist = await removeWishlistItem(session.id, c.req.param("productId"));
  return c.json({ data: wishlist });
});
