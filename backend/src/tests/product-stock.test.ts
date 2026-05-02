import { describe, expect, test } from "bun:test";
import { buildEvenStockVariants, stockKeyForSelection } from "../products/stock";

describe("product variant stock helpers", () => {
  test("builds evenly distributed stock rows by color and size", () => {
    const rows = buildEvenStockVariants({
      totalStock: 7,
      sizes: "S / M",
      colorVariants: [
        { id: "variant-a", name: "Caramel", displayOrder: 0 },
        { id: "variant-b", name: "Milo", displayOrder: 1 }
      ]
    });

    expect(rows).toEqual([
      { colorVariantId: "variant-a", colorName: "Caramel", colorKey: "variant:variant-a", size: "S", stock: 2, displayOrder: 0 },
      { colorVariantId: "variant-a", colorName: "Caramel", colorKey: "variant:variant-a", size: "M", stock: 2, displayOrder: 1 },
      { colorVariantId: "variant-b", colorName: "Milo", colorKey: "variant:variant-b", size: "S", stock: 2, displayOrder: 2 },
      { colorVariantId: "variant-b", colorName: "Milo", colorKey: "variant:variant-b", size: "M", stock: 1, displayOrder: 3 }
    ]);
  });

  test("uses a default color row when a product has no color variants", () => {
    expect(buildEvenStockVariants({
      totalStock: 3,
      sizes: "One Size",
      colorVariants: []
    })).toEqual([
      { colorVariantId: null, colorName: "Default", colorKey: "name:default", size: "One Size", stock: 3, displayOrder: 0 }
    ]);
  });

  test("builds stable keys for variant and name based stock lookups", () => {
    expect(stockKeyForSelection({ colorVariantId: "variant-a", colorName: "Caramel", size: "M" })).toBe("variant:variant-a::M");
    expect(stockKeyForSelection({ colorName: "Dark Maroon", size: "L" })).toBe("name:dark-maroon::L");
  });
});
