import { describe, expect, test } from "bun:test";
import { validateProductImageFile } from "../uploads/supabase";

const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const webpBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

describe("secure product uploads", () => {
  test("accepts supported image magic bytes", async () => {
    await expect(validateProductImageFile(new File([pngBytes], "image.png", { type: "image/png" }))).resolves.toMatchObject({
      extension: "png",
      contentType: "image/png"
    });
    await expect(validateProductImageFile(new File([jpgBytes], "image.jpg", { type: "image/jpeg" }))).resolves.toMatchObject({
      extension: "jpg",
      contentType: "image/jpeg"
    });
    await expect(validateProductImageFile(new File([webpBytes], "image.webp", { type: "image/webp" }))).resolves.toMatchObject({
      extension: "webp",
      contentType: "image/webp"
    });
  });

  test("rejects unsupported and spoofed files", async () => {
    await expect(validateProductImageFile(new File(["<svg></svg>"], "bad.svg", { type: "image/svg+xml" }))).rejects.toThrow("Format tidak didukung");
    await expect(validateProductImageFile(new File(["<script></script>"], "bad.jpg", { type: "image/jpeg" }))).rejects.toThrow("Format tidak didukung");
  });

  test("rejects oversized files", async () => {
    await expect(validateProductImageFile(new File([pngBytes], "large.png", { type: "image/png" }), 4)).rejects.toThrow("File terlalu besar");
  });
});
