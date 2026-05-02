import { describe, expect, test } from "bun:test";
import { mergeCartLines, resolveAuthenticatedCustomerUserId, uniqueWishlistProductIds } from "../storefront/customer-session";

describe("customer shopping session helpers", () => {
  test("merges matching cart lines by product option", () => {
    expect(mergeCartLines([
      { productId: "p1", colorKey: "variant:red", size: "M", quantity: 1 },
      { productId: "p1", colorKey: "variant:red", size: "M", quantity: 2 },
      { productId: "p1", colorKey: "variant:blue", size: "M", quantity: 1 },
      { productId: "p2", colorKey: "variant:red", size: "L", quantity: 3 }
    ])).toEqual([
      { productId: "p1", colorKey: "variant:red", size: "M", quantity: 3 },
      { productId: "p1", colorKey: "variant:blue", size: "M", quantity: 1 },
      { productId: "p2", colorKey: "variant:red", size: "L", quantity: 3 }
    ]);
  });

  test("deduplicates wishlist products in insertion order", () => {
    expect(uniqueWishlistProductIds(["p1", "p2", "p1", "p3", "p2"])).toEqual(["p1", "p2", "p3"]);
  });

  test("ignores authenticated session ids that are not present in the user table", async () => {
    await expect(resolveAuthenticatedCustomerUserId("stale-user-id", async () => null)).resolves.toBeNull();
    await expect(resolveAuthenticatedCustomerUserId("real-user-id", async () => ({ id: "real-user-id" }))).resolves.toBe("real-user-id");
  });
});
