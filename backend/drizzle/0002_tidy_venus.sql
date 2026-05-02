CREATE TABLE "ProductVariantStock" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"colorVariantId" text,
	"colorName" text NOT NULL,
	"colorKey" text NOT NULL,
	"size" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ProductVariantStock" ADD CONSTRAINT "ProductVariantStock_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductVariantStock" ADD CONSTRAINT "ProductVariantStock_colorVariantId_ProductColorVariant_id_fk" FOREIGN KEY ("colorVariantId") REFERENCES "public"."ProductColorVariant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_variant_stocks_product_id_idx" ON "ProductVariantStock" USING btree ("productId","displayOrder");--> statement-breakpoint
CREATE INDEX "product_variant_stocks_color_variant_id_idx" ON "ProductVariantStock" USING btree ("colorVariantId");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_stocks_option_unique_idx" ON "ProductVariantStock" USING btree ("productId","colorKey","size");--> statement-breakpoint
WITH "ProductSizeOption" AS (
	SELECT
		p."id" AS "productId",
		p."stock" AS "totalStock",
		trim(s."sizeValue") AS "size",
		(s."sizeOrder"::integer - 1) AS "sizeOrder"
	FROM "Product" p
	CROSS JOIN LATERAL unnest(string_to_array(p."sizes", '/')) WITH ORDINALITY AS s("sizeValue", "sizeOrder")
	WHERE trim(s."sizeValue") <> ''
),
"ProductColorOption" AS (
	SELECT
		p."id" AS "productId",
		v."id" AS "colorVariantId",
		v."name" AS "colorName",
		('variant:' || v."id") AS "colorKey",
		v."displayOrder" AS "colorOrder"
	FROM "Product" p
	INNER JOIN "ProductColorVariant" v ON v."productId" = p."id"
	UNION ALL
	SELECT
		p."id" AS "productId",
		NULL AS "colorVariantId",
		'Default' AS "colorName",
		'name:default' AS "colorKey",
		0 AS "colorOrder"
	FROM "Product" p
	WHERE NOT EXISTS (
		SELECT 1 FROM "ProductColorVariant" v WHERE v."productId" = p."id"
	)
),
"StockCombination" AS (
	SELECT
		s."productId",
		c."colorVariantId",
		c."colorName",
		c."colorKey",
		s."size",
		s."totalStock",
		(row_number() OVER (PARTITION BY s."productId" ORDER BY c."colorOrder", s."sizeOrder") - 1)::integer AS "displayOrder",
		count(*) OVER (PARTITION BY s."productId")::integer AS "combinationCount"
	FROM "ProductSizeOption" s
	INNER JOIN "ProductColorOption" c ON c."productId" = s."productId"
)
INSERT INTO "ProductVariantStock" (
	"id",
	"productId",
	"colorVariantId",
	"colorName",
	"colorKey",
	"size",
	"stock",
	"displayOrder",
	"createdAt",
	"updatedAt"
)
SELECT
	('stock_' || md5("productId" || '::' || "colorKey" || '::' || "size")) AS "id",
	"productId",
	"colorVariantId",
	"colorName",
	"colorKey",
	"size",
	(floor("totalStock"::numeric / "combinationCount")::integer + CASE WHEN "displayOrder" < ("totalStock" % "combinationCount") THEN 1 ELSE 0 END) AS "stock",
	"displayOrder",
	now(),
	now()
FROM "StockCombination"
WHERE "combinationCount" > 0;
