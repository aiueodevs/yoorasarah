CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ProductColorVariant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hex" text NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"productId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductImage" (
	"id" text PRIMARY KEY NOT NULL,
	"storagePath" text,
	"publicUrl" text NOT NULL,
	"alt" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"productId" text NOT NULL,
	"colorVariantId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"path" text NOT NULL,
	"price" integer NOT NULL,
	"colorCount" integer DEFAULT 0 NOT NULL,
	"sizes" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"isBestSeller" boolean DEFAULT false NOT NULL,
	"salesCount" integer DEFAULT 0 NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"publishedAt" timestamp DEFAULT now() NOT NULL,
	"description" jsonb,
	"materials" jsonb,
	"care" jsonb,
	"categoryId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Product_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"impersonatedBy" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"banReason" text,
	"banExpires" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductColorVariant" ADD CONSTRAINT "ProductColorVariant_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_colorVariantId_ProductColorVariant_id_fk" FOREIGN KEY ("colorVariantId") REFERENCES "public"."ProductColorVariant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_Category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "product_color_variants_product_id_idx" ON "ProductColorVariant" USING btree ("productId","displayOrder");--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "ProductImage" USING btree ("productId","displayOrder");--> statement-breakpoint
CREATE INDEX "product_images_color_variant_id_idx" ON "ProductImage" USING btree ("colorVariantId","displayOrder");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "Product" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "products_published_idx" ON "Product" USING btree ("isPublished","publishedAt");--> statement-breakpoint
CREATE INDEX "products_best_seller_idx" ON "Product" USING btree ("isBestSeller","salesCount");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");