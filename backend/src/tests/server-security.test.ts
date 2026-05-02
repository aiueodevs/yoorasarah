import { describe, expect, test } from "bun:test";
import { createApp, internalErrorResponse } from "../server";

describe("server security behavior", () => {
  test("does not allow untrusted CORS origins", async () => {
    const response = await createApp().request("/health", {
      headers: { origin: "https://evil.example" }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  test("allows trusted CORS origins", async () => {
    const response = await createApp().request("/health", {
      headers: { origin: "http://localhost:3000" }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
  });

  test("sanitizes unknown production errors", () => {
    expect(internalErrorResponse(new Error("database secret leaked"), "production")).toEqual({
      status: 500,
      body: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error"
      }
    });
  });

  test("returns empty cart without creating a guest session on read", async () => {
    const response = await createApp().request("/api/cart");
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      data: {
        items: [],
        subtotal: 0,
        totalQuantity: 0
      }
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
