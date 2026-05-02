import { describe, expect, test } from "bun:test";
import { cacheKeysForProductChange, publicCacheKeys } from "../products/cache-keys";

describe("product cache keys", () => {
  test("returns global and product-specific keys for invalidation", () => {
    expect(cacheKeysForProductChange({ path: "/dress/medina-dress-8751", categorySlug: "dress" })).toEqual([
      publicCacheKeys.products,
      publicCacheKeys.categories,
      publicCacheKeys.newArrival,
      publicCacheKeys.bestSeller,
      "products:detail:dress/medina-dress-8751",
      "products:detail:medina-dress-8751",
      "categories:dress:products"
    ]);
  });
});
