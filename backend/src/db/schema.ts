import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const timestamps = {
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull()
};

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  ...timestamps
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    impersonatedBy: text("impersonatedBy"),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    ...timestamps
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    ...timestamps
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    ...timestamps
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const categories = pgTable("Category", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  ...timestamps
});

export const products = pgTable(
  "Product",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    path: text("path").notNull().unique(),
    price: integer("price").notNull(),
    colorCount: integer("colorCount").default(0).notNull(),
    sizes: text("sizes").notNull(),
    stock: integer("stock").default(0).notNull(),
    badge: text("badge"),
    isBestSeller: boolean("isBestSeller").default(false).notNull(),
    salesCount: integer("salesCount").default(0).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    publishedAt: timestamp("publishedAt").defaultNow().notNull(),
    description: jsonb("description").$type<string[]>(),
    materials: jsonb("materials").$type<string[]>(),
    care: jsonb("care").$type<string[]>(),
    categoryId: text("categoryId").notNull().references(() => categories.id, { onDelete: "restrict" }),
    ...timestamps
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_published_idx").on(table.isPublished, table.publishedAt),
    index("products_best_seller_idx").on(table.isBestSeller, table.salesCount)
  ]
);

export const productColorVariants = pgTable(
  "ProductColorVariant",
  {
    id: id(),
    name: text("name").notNull(),
    hex: text("hex").notNull(),
    displayOrder: integer("displayOrder").default(0).notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    ...timestamps
  },
  (table) => [index("product_color_variants_product_id_idx").on(table.productId, table.displayOrder)]
);

export const productVariantStocks = pgTable(
  "ProductVariantStock",
  {
    id: id(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    colorVariantId: text("colorVariantId").references(() => productColorVariants.id, { onDelete: "set null" }),
    colorName: text("colorName").notNull(),
    colorKey: text("colorKey").notNull(),
    size: text("size").notNull(),
    stock: integer("stock").default(0).notNull(),
    displayOrder: integer("displayOrder").default(0).notNull(),
    ...timestamps
  },
  (table) => [
    index("product_variant_stocks_product_id_idx").on(table.productId, table.displayOrder),
    index("product_variant_stocks_color_variant_id_idx").on(table.colorVariantId),
    uniqueIndex("product_variant_stocks_option_unique_idx").on(table.productId, table.colorKey, table.size)
  ]
);

export const productImages = pgTable(
  "ProductImage",
  {
    id: id(),
    storagePath: text("storagePath"),
    publicUrl: text("publicUrl").notNull(),
    alt: text("alt"),
    displayOrder: integer("displayOrder").default(0).notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    colorVariantId: text("colorVariantId").references(() => productColorVariants.id, { onDelete: "cascade" }),
    ...timestamps
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId, table.displayOrder),
    index("product_images_color_variant_id_idx").on(table.colorVariantId, table.displayOrder)
  ]
);

export const shoppingSessions = pgTable(
  "ShoppingSession",
  {
    id: id(),
    token: text("token").notNull().unique(),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
    ...timestamps
  },
  (table) => [
    index("shopping_sessions_user_id_idx").on(table.userId),
    index("shopping_sessions_updated_at_idx").on(table.updatedAt)
  ]
);

export const cartItems = pgTable(
  "CartItem",
  {
    id: id(),
    shoppingSessionId: text("shoppingSessionId").notNull().references(() => shoppingSessions.id, { onDelete: "cascade" }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    colorVariantId: text("colorVariantId").references(() => productColorVariants.id, { onDelete: "set null" }),
    colorKey: text("colorKey").notNull(),
    colorName: text("colorName").notNull(),
    size: text("size").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: integer("unitPrice").notNull(),
    ...timestamps
  },
  (table) => [
    index("cart_items_session_idx").on(table.shoppingSessionId, table.updatedAt),
    index("cart_items_product_idx").on(table.productId),
    uniqueIndex("cart_items_option_unique_idx").on(table.shoppingSessionId, table.productId, table.colorKey, table.size)
  ]
);

export const wishlistItems = pgTable(
  "WishlistItem",
  {
    id: id(),
    shoppingSessionId: text("shoppingSessionId").notNull().references(() => shoppingSessions.id, { onDelete: "cascade" }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    ...timestamps
  },
  (table) => [
    index("wishlist_items_session_idx").on(table.shoppingSessionId, table.createdAt),
    uniqueIndex("wishlist_items_product_unique_idx").on(table.shoppingSessionId, table.productId)
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  shoppingSessions: many(shoppingSessions)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  colorVariants: many(productColorVariants),
  stockVariants: many(productVariantStocks),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems)
}));

export const productColorVariantRelations = relations(productColorVariants, ({ one, many }) => ({
  product: one(products, { fields: [productColorVariants.productId], references: [products.id] }),
  images: many(productImages),
  stockVariants: many(productVariantStocks)
}));

export const productVariantStockRelations = relations(productVariantStocks, ({ one }) => ({
  product: one(products, { fields: [productVariantStocks.productId], references: [products.id] }),
  colorVariant: one(productColorVariants, { fields: [productVariantStocks.colorVariantId], references: [productColorVariants.id] })
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
  colorVariant: one(productColorVariants, { fields: [productImages.colorVariantId], references: [productColorVariants.id] })
}));

export const shoppingSessionRelations = relations(shoppingSessions, ({ one, many }) => ({
  user: one(user, { fields: [shoppingSessions.userId], references: [user.id] }),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems)
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  shoppingSession: one(shoppingSessions, { fields: [cartItems.shoppingSessionId], references: [shoppingSessions.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
  colorVariant: one(productColorVariants, { fields: [cartItems.colorVariantId], references: [productColorVariants.id] })
}));

export const wishlistItemRelations = relations(wishlistItems, ({ one }) => ({
  shoppingSession: one(shoppingSessions, { fields: [wishlistItems.shoppingSessionId], references: [shoppingSessions.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] })
}));

export type User = typeof user.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductColorVariant = typeof productColorVariants.$inferSelect;
export type ProductVariantStock = typeof productVariantStocks.$inferSelect;
export type ShoppingSession = typeof shoppingSessions.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
