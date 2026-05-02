import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../db/schema";
import { env } from "../env";
import { HttpError } from "../http-error";
import { createProductSchema, productMutationSchema, stockSchema } from "../products/schemas";
import {
  createProduct,
  deleteProduct,
  getAdminProduct,
  listAdminProducts,
  updateProduct,
  updateProductStock
} from "../products/service";
import { assertRateLimit } from "../rate-limit";
import { uploadProductImage } from "../uploads/supabase";

type AdminVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export const adminRoutes = new Hono<{ Variables: AdminVariables }>();

async function rateLimitAdmin(c: Context<{ Variables: AdminVariables }>, prefix: string, limit: number, windowSeconds: number) {
  const adminUser = c.get("user");
  await assertRateLimit({
    key: `${prefix}:admin:${adminUser.id}`,
    limit,
    windowSeconds
  });
}

adminRoutes.use("/api/admin/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const adminUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { id: true, email: true, name: true, role: true }
  });

  if (!adminUser || adminUser.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403);
  }

  c.set("user", adminUser);
  await next();
});

adminRoutes.get("/api/admin/me", (c) => c.json({ data: c.get("user") }));

adminRoutes.get("/api/admin/products", async (c) => {
  const products = await listAdminProducts();
  return c.json({ data: products });
});

adminRoutes.get("/api/admin/products/:id", async (c) => {
  const product = await getAdminProduct(c.req.param("id"));
  if (!product) return c.json({ message: "Product not found" }, 404);
  return c.json({ data: product });
});

adminRoutes.post("/api/admin/products", zValidator("json", createProductSchema), async (c) => {
  await rateLimitAdmin(c, "admin-products", 120, 60);
  const product = await createProduct(c.req.valid("json"));
  return c.json({ data: product }, 201);
});

adminRoutes.patch("/api/admin/products/:id", zValidator("json", productMutationSchema), async (c) => {
  await rateLimitAdmin(c, "admin-products", 120, 60);
  const product = await updateProduct(c.req.param("id"), c.req.valid("json"));
  if (!product) return c.json({ message: "Product not found" }, 404);
  return c.json({ data: product });
});

adminRoutes.delete("/api/admin/products/:id", async (c) => {
  await rateLimitAdmin(c, "admin-products", 120, 60);
  const deleted = await deleteProduct(c.req.param("id"));
  if (!deleted) return c.json({ message: "Product not found" }, 404);
  return c.json({ data: { deleted: true } });
});

adminRoutes.patch("/api/admin/products/:id/stock", zValidator("json", stockSchema), async (c) => {
  await rateLimitAdmin(c, "admin-products", 120, 60);
  const product = await updateProductStock(c.req.param("id"), c.req.valid("json").stockVariants);
  if (!product) return c.json({ message: "Product not found" }, 404);
  return c.json({ data: product });
});

adminRoutes.post("/api/admin/uploads", async (c) => {
  await rateLimitAdmin(c, "admin-upload", 20, 60 * 60);
  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > env.MAX_UPLOAD_BYTES + 1024 * 1024) {
    throw new HttpError(413, "UPLOAD_TOO_LARGE", `File terlalu besar. Maksimal ${Math.floor(env.MAX_UPLOAD_BYTES / 1024 / 1024)}MB.`);
  }

  const form = await c.req.formData();
  const file = form.get("file");
  const productSlug = form.get("productSlug");
  const alt = form.get("alt");

  if (!(file instanceof File)) {
    return c.json({ message: "File is required" }, 400);
  }

  if (typeof productSlug !== "string" || !productSlug.trim()) {
    return c.json({ message: "productSlug is required" }, 400);
  }

  const uploaded = await uploadProductImage({
    file,
    productSlug,
    alt: typeof alt === "string" ? alt : undefined
  });

  return c.json({ data: uploaded }, 201);
});
