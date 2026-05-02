import { describe, expect, test } from "bun:test";
import { isBestSellerCollectionProduct } from "../products/service";

describe("best seller collection contract", () => {
  test("only includes published products manually marked as best seller", () => {
    expect(isBestSellerCollectionProduct({
      isPublished: true,
      isBestSeller: true,
      salesCount: 0
    })).toBe(true);

    expect(isBestSellerCollectionProduct({
      isPublished: true,
      isBestSeller: false,
      salesCount: 250
    })).toBe(false);

    expect(isBestSellerCollectionProduct({
      isPublished: false,
      isBestSeller: true,
      salesCount: 999
    })).toBe(false);
  });
});
