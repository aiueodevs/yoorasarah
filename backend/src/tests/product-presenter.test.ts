import { describe, expect, test } from "bun:test";
import { toPublicProduct } from "../products/presenter";

describe("toPublicProduct", () => {
  test("returns storefront-compatible product data with full path slug", () => {
    const product = toPublicProduct({
      name: "Medina Dress",
      slug: "medina-dress-8751",
      path: "/dress/medina-dress-8751",
      price: 179999,
      colorCount: 2,
      sizes: "S / M / L",
      stock: 14,
      isBestSeller: true,
      salesCount: 90,
      publishedAt: new Date("2026-04-09T00:00:00.000Z"),
      category: { name: "Dress", slug: "dress", description: "Dress pilihan" },
      images: [
        { publicUrl: "https://example.com/medina-main.jpg", alt: "Main", displayOrder: 0 },
        { publicUrl: "https://example.com/medina-detail.jpg", alt: "Detail", displayOrder: 1 }
      ],
      colorVariants: [
        {
          id: "variant-caramel",
          name: "Caramel",
          hex: "#622c1f",
          displayOrder: 0,
          images: [{ publicUrl: "https://example.com/medina-caramel.jpg", alt: "Caramel", displayOrder: 0 }]
        }
      ],
      stockVariants: [
        { colorVariantId: "variant-caramel", colorName: "Caramel", colorKey: "variant:variant-caramel", size: "S", stock: 2, displayOrder: 0 },
        { colorVariantId: "variant-caramel", colorName: "Caramel", colorKey: "variant:variant-caramel", size: "M", stock: 0, displayOrder: 1 }
      ],
      description: ["Flowy"],
      materials: ["Yorleza"],
      care: ["Cuci lembut"]
    });

    expect(product.slug).toBe("/dress/medina-dress-8751");
    expect(product.price).toBe("Rp179.999");
    expect(product.image).toBe("https://example.com/medina-main.jpg");
    expect(product.gallery).toEqual(["https://example.com/medina-main.jpg", "https://example.com/medina-detail.jpg"]);
    expect(product.badge).toBe("Best Seller");
    expect(product.colorVariants).toEqual([
      { id: "variant-caramel", name: "Caramel", hex: "#622c1f", gallery: ["https://example.com/medina-caramel.jpg"] }
    ]);
    expect(product.stockVariants).toEqual([
      { colorVariantId: "variant-caramel", colorName: "Caramel", colorKey: "variant:variant-caramel", size: "S", stock: 2 },
      { colorVariantId: "variant-caramel", colorName: "Caramel", colorKey: "variant:variant-caramel", size: "M", stock: 0 }
    ]);
  });
});
