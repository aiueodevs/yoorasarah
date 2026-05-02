import { describe, expect, test } from "bun:test";
import { normalizeAuthEmailRequest } from "../auth-request";
import { searchCacheKey } from "../products/cache-keys";
import { cartItemSchema, cartUpdateSchema, customerEmailSchema, productSearchSchema, wishlistItemSchema } from "../storefront/schemas";
import { productMutationSchema, stockSchema } from "../products/schemas";

describe("storefront contracts", () => {
  test("normalizes cart item input before it reaches the service", () => {
    const parsed = cartItemSchema.parse({
      productId: "product-1",
      colorVariantId: "",
      colorName: "  Dark Maroon  ",
      size: " M ",
      quantity: 99
    });

    expect(parsed).toEqual({
      productId: "product-1",
      colorVariantId: undefined,
      colorName: "Dark Maroon",
      size: "M",
      quantity: 99
    });
  });

  test("rejects zero quantity cart items", () => {
    expect(() => cartItemSchema.parse({
      productId: "product-1",
      colorName: "Dark Maroon",
      size: "M",
      quantity: 0
    })).toThrow();
  });

  test("accepts cart item option updates", () => {
    expect(cartUpdateSchema.parse({
      colorVariantId: "variant-1",
      colorName: "  Dark Teal ",
      size: " S ",
      quantity: 2
    })).toEqual({
      colorVariantId: "variant-1",
      colorName: "Dark Teal",
      size: "S",
      quantity: 2
    });
  });

  test("accepts partial cart item option updates", () => {
    expect(cartUpdateSchema.parse({
      colorVariantId: "variant-2",
      colorName: "  Dark Maroon "
    })).toEqual({
      colorVariantId: "variant-2",
      colorName: "Dark Maroon"
    });

    expect(cartUpdateSchema.parse({ size: " M " })).toEqual({ size: "M" });
  });

  test("rejects empty cart item updates", () => {
    expect(() => cartUpdateSchema.parse({})).toThrow();
  });

  test("accepts product stock variants for admin product mutations", () => {
    expect(productMutationSchema.parse({
      stockVariants: [
        {
          colorVariantId: "variant-a",
          colorName: "  Caramel ",
          colorKey: "variant:variant-a",
          size: " M ",
          stock: 4,
          displayOrder: 1
        }
      ]
    })).toEqual({
      stockVariants: [
        {
          colorVariantId: "variant-a",
          colorName: "Caramel",
          colorKey: "variant:variant-a",
          size: "M",
          stock: 4,
          displayOrder: 1
        }
      ]
    });
  });

  test("rejects negative stock variants", () => {
    expect(() => productMutationSchema.parse({
      stockVariants: [{ colorName: "Caramel", colorKey: "name:caramel", size: "M", stock: -1 }]
    })).toThrow();
  });

  test("rejects oversized admin product payload arrays", () => {
    expect(() => productMutationSchema.parse({
      images: Array.from({ length: 13 }, (_, index) => ({
        publicUrl: `https://yoorasarah-products.fly.storage.tigris.dev/products/${index}.jpg`,
        displayOrder: index
      }))
    })).toThrow();

    expect(() => productMutationSchema.parse({
      colorVariants: Array.from({ length: 21 }, (_, index) => ({
        name: `Color ${index}`,
        hex: "#C38775",
        displayOrder: index,
        images: []
      }))
    })).toThrow();
  });

  test("rejects unsafe image URL origins and invalid color hex", () => {
    expect(() => productMutationSchema.parse({
      images: [{ publicUrl: "https://evil.example/products/1.jpg" }]
    })).toThrow();

    expect(() => productMutationSchema.parse({
      colorVariants: [{ name: "Bad", hex: "red", images: [] }]
    })).toThrow();
  });

  test("accepts stock matrix updates on admin stock endpoint", () => {
    expect(stockSchema.parse({
      stockVariants: [
        { colorName: "Caramel", colorKey: "name:caramel", size: "S", stock: 2 }
      ]
    })).toEqual({
      stockVariants: [
        { colorName: "Caramel", colorKey: "name:caramel", size: "S", stock: 2, displayOrder: 0 }
      ]
    });
  });

  test("accepts wishlist product ids only", () => {
    expect(wishlistItemSchema.parse({ productId: "product-1" })).toEqual({ productId: "product-1" });
    expect(() => wishlistItemSchema.parse({ productId: "" })).toThrow();
  });

  test("normalizes customer auth email checks", () => {
    expect(customerEmailSchema.parse({ email: "  AIUEODEVS@GMAIL.COM " })).toEqual({ email: "aiueodevs@gmail.com" });
  });

  test("normalizes Better Auth email JSON requests before auth handler", async () => {
    const request = new Request("http://localhost:4000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "  AIUEODEVS@GMAIL.COM ", password: "password" })
    });

    const normalized = await normalizeAuthEmailRequest(request);

    expect(await normalized.json()).toEqual({ email: "aiueodevs@gmail.com", password: "password" });
  });

  test("normalizes Better Auth email form requests before auth handler", async () => {
    const request = new Request("http://localhost:4000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "  ADMIN@YOORASARAH.LOCAL ",
        password: "password",
        name: "Admin"
      })
    });

    const normalized = await normalizeAuthEmailRequest(request);
    const body = new URLSearchParams(await normalized.text());

    expect(body.get("email")).toBe("admin@yoorasarah.local");
    expect(body.get("name")).toBe("Admin");
  });

  test("normalizes Better Auth verification email resend requests", async () => {
    const request = new Request("http://localhost:4000/api/auth/send-verification-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "  USER@EXAMPLE.COM ", callbackURL: "/profile" })
    });

    const normalized = await normalizeAuthEmailRequest(request);

    expect(await normalized.json()).toEqual({ email: "user@example.com", callbackURL: "/profile" });
  });

  test("normalizes Better Auth change email requests", async () => {
    const request = new Request("http://localhost:4000/api/auth/change-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newEmail: "  NEW@EXAMPLE.COM ", callbackURL: "/profile" })
    });

    const normalized = await normalizeAuthEmailRequest(request);

    expect(await normalized.json()).toEqual({ newEmail: "new@example.com", callbackURL: "/profile" });
  });

  test("builds stable cache keys for public search filters", () => {
    expect(searchCacheKey({
      q: "  Medina Dress ",
      categorySlug: "dress",
      sort: "newest",
      page: 2,
      limit: 12
    })).toBe("products:search:category=dress:limit=12:page=2:q=medina-dress:sort=newest");
  });

  test("rejects public search queries longer than 80 characters", () => {
    expect(() => productSearchSchema.parse({ q: "x".repeat(81) })).toThrow();
  });
});
