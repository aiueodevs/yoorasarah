import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db, postgresClient } from ".";
import { categories, productColorVariants, productImages, productVariantStocks, products as productsTable, user } from "./schema";
import { categorySlugFromPath, leafSlugFromPath, parsePriceToAmount } from "../products/slug";
import { products } from "../../../frontend/lib/data";
import { buildEvenStockVariants } from "../products/stock";

const categoryMeta: Record<string, { name: string; title: string; description: string; sortOrder: number }> = {
  produk: { name: "Produk", title: "Semua Produk Yoora Sarah", description: "Seluruh pilihan Yoora Sarah dalam satu katalog lengkap.", sortOrder: 0 },
  "best-seller": { name: "Best Seller", title: "Best Seller Yoora Sarah", description: "Pilihan produk favorit yang paling banyak diminati.", sortOrder: 1 },
  terbaru: { name: "New Arrival", title: "Baru datang, siap dimiliki.", description: "Produk terbaru dengan tone studio yang lembut dan potongan yang sudah dikurasi.", sortOrder: 2 },
  dress: { name: "Dress", title: "Dress", description: "Setiap dress memiliki ceritanya.", sortOrder: 3 },
  "abaya-2481": { name: "Abaya", title: "Abaya", description: "Layer formal dengan jatuh kain yang tenang.", sortOrder: 4 },
  "hijab-1544": { name: "Hijab", title: "Hijab", description: "Pilihan hijab yang rapi untuk setiap hari.", sortOrder: 5 },
  "khimar-5295": { name: "Khimar", title: "Khimar", description: "Coverage panjang dengan tampilan yang anggun.", sortOrder: 6 },
  "pashmina-2310": { name: "Pashmina", title: "Pashmina", description: "Pashmina ringan yang mudah dipadukan.", sortOrder: 7 },
  "kids-9967": { name: "Kids", title: "Kids", description: "Busana manis untuk momen si kecil.", sortOrder: 8 },
  "footwear-8675": { name: "Footwear", title: "Footwear", description: "Pelengkap tampilan yang tetap nyaman dipakai.", sortOrder: 9 },
  "accessories-4472": { name: "Accessories", title: "Accessories", description: "Detail kecil yang membuat look terasa selesai.", sortOrder: 10 },
  "essentials-7002": { name: "Essentials", title: "Essentials", description: "Produk dasar untuk layering sehari-hari.", sortOrder: 11 },
  "one-set-5182": { name: "One Set", title: "One Set", description: "Set lengkap yang memudahkan styling.", sortOrder: 12 }
};

async function seedAdmin() {
  const email = Bun.env.ADMIN_EMAIL?.trim();
  const password = Bun.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    console.warn("Skipping admin seed. Set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin account.");
    return;
  }

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Yoora Sarah Admin"
      }
    });
  }

  await db.update(user).set({ role: "admin", emailVerified: true, updatedAt: new Date() }).where(eq(user.email, email));
}

async function seedCategories() {
  for (const [slug, meta] of Object.entries(categoryMeta)) {
    const now = new Date();
    await db
      .insert(categories)
      .values({ slug, ...meta, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { ...meta, updatedAt: new Date() }
      });
  }
}

async function seedProducts() {
  const categoryRows = await db.query.categories.findMany();
  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category]));

  for (const [index, product] of products.entries()) {
    const path = product.slug;
    const leafSlug = leafSlugFromPath(path);
    const categorySlug = categorySlugFromPath(path);
    const category = categoryBySlug.get(categorySlug);

    if (!category) {
      throw new Error(`Missing category for ${product.name}: ${categorySlug}`);
    }

    const isBestSeller = product.badge === "Best Seller";
    const salesCount = isBestSeller ? 1000 - index * 17 : Math.max(0, (product.stock ?? 0) - index);
    const publishedAt = new Date(Date.now() - index * 86_400_000);
    const now = new Date();
    const [createdProduct] = await db
      .insert(productsTable)
      .values({
        name: product.name,
        slug: leafSlug,
        path,
        categoryId: category.id,
        price: parsePriceToAmount(product.price),
        colorCount: product.colors,
        sizes: product.sizes,
        stock: product.stock ?? 0,
        badge: product.badge,
        isBestSeller,
        salesCount,
        isPublished: true,
        publishedAt,
        description: product.description,
        materials: product.materials,
        care: product.care,
        createdAt: now,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: productsTable.path,
        set: {
          name: product.name,
          slug: leafSlug,
          categoryId: category.id,
          price: parsePriceToAmount(product.price),
          colorCount: product.colors,
          sizes: product.sizes,
          stock: product.stock ?? 0,
          badge: product.badge,
          isBestSeller,
          salesCount,
          isPublished: true,
          publishedAt,
          description: product.description,
          materials: product.materials,
          care: product.care,
          updatedAt: new Date()
        }
      })
      .returning();

    await db.delete(productImages).where(eq(productImages.productId, createdProduct.id));
    await db.delete(productVariantStocks).where(eq(productVariantStocks.productId, createdProduct.id));
    await db.delete(productColorVariants).where(eq(productColorVariants.productId, createdProduct.id));

    const gallery = product.gallery?.length ? product.gallery : [product.image];
    for (const [displayOrder, publicUrl] of gallery.entries()) {
      const imageNow = new Date();
      await db.insert(productImages).values({
        productId: createdProduct.id,
        publicUrl,
        storagePath: publicUrl.includes("/products/") ? `products/${publicUrl.split("/products/").at(-1)}` : null,
        alt: product.name,
        displayOrder,
        createdAt: imageNow,
        updatedAt: imageNow
      });
    }

    const createdVariants: Array<{ id: string; name: string; displayOrder: number }> = [];
    for (const [displayOrder, variant] of (product.colorVariants ?? []).entries()) {
      const variantNow = new Date();
      const [createdVariant] = await db.insert(productColorVariants).values({
        productId: createdProduct.id,
        name: variant.name,
        hex: variant.hex,
        displayOrder,
        createdAt: variantNow,
        updatedAt: variantNow
      }).returning();
      createdVariants.push({
        id: createdVariant.id,
        name: createdVariant.name,
        displayOrder
      });

      for (const [imageOrder, publicUrl] of variant.gallery.entries()) {
        const imageNow = new Date();
        await db.insert(productImages).values({
          productId: createdProduct.id,
          colorVariantId: createdVariant.id,
          publicUrl,
          storagePath: publicUrl.includes("/products/") ? `products/${publicUrl.split("/products/").at(-1)}` : null,
          alt: `${product.name} ${variant.name}`,
          displayOrder: imageOrder,
          createdAt: imageNow,
          updatedAt: imageNow
        });
      }
    }

    const stockRows = buildEvenStockVariants({
      totalStock: product.stock ?? 0,
      sizes: product.sizes,
      colorVariants: createdVariants
    });
    for (const stockRow of stockRows) {
      const stockNow = new Date();
      await db.insert(productVariantStocks).values({
        productId: createdProduct.id,
        colorVariantId: stockRow.colorVariantId,
        colorName: stockRow.colorName,
        colorKey: stockRow.colorKey,
        size: stockRow.size,
        stock: stockRow.stock,
        displayOrder: stockRow.displayOrder,
        createdAt: stockNow,
        updatedAt: stockNow
      });
    }
  }
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedProducts();
}

main()
  .then(async () => {
    await postgresClient.end();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await postgresClient.end();
    process.exit(1);
  });
