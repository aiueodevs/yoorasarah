CREATE TABLE "CartItem" (
	"id" text PRIMARY KEY NOT NULL,
	"shoppingSessionId" text NOT NULL,
	"productId" text NOT NULL,
	"colorVariantId" text,
	"colorKey" text NOT NULL,
	"colorName" text NOT NULL,
	"size" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ShoppingSession" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"userId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ShoppingSession_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "WishlistItem" (
	"id" text PRIMARY KEY NOT NULL,
	"shoppingSessionId" text NOT NULL,
	"productId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_shoppingSessionId_ShoppingSession_id_fk" FOREIGN KEY ("shoppingSessionId") REFERENCES "public"."ShoppingSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_colorVariantId_ProductColorVariant_id_fk" FOREIGN KEY ("colorVariantId") REFERENCES "public"."ProductColorVariant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShoppingSession" ADD CONSTRAINT "ShoppingSession_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_shoppingSessionId_ShoppingSession_id_fk" FOREIGN KEY ("shoppingSessionId") REFERENCES "public"."ShoppingSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_items_session_idx" ON "CartItem" USING btree ("shoppingSessionId","updatedAt");--> statement-breakpoint
CREATE INDEX "cart_items_product_idx" ON "CartItem" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_option_unique_idx" ON "CartItem" USING btree ("shoppingSessionId","productId","colorKey","size");--> statement-breakpoint
CREATE INDEX "shopping_sessions_user_id_idx" ON "ShoppingSession" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "shopping_sessions_updated_at_idx" ON "ShoppingSession" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "wishlist_items_session_idx" ON "WishlistItem" USING btree ("shoppingSessionId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_items_product_unique_idx" ON "WishlistItem" USING btree ("shoppingSessionId","productId");