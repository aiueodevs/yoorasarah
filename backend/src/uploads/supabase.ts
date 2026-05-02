import { createClient } from "@supabase/supabase-js";
import { env } from "../env";
import { HttpError } from "../http-error";
import { slugify } from "../products/slug";

type UploadProductImageInput = {
  file: File;
  productSlug: string;
  alt?: string;
};

const uploadTypes = {
  "image/jpeg": {
    extension: "jpg",
    matches: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  },
  "image/png": {
    extension: "png",
    matches: (bytes: Uint8Array) => (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  },
  "image/webp": {
    extension: "webp",
    matches: (bytes: Uint8Array) => (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    )
  }
} satisfies Record<string, { extension: string; matches: (bytes: Uint8Array) => boolean }>;

export const SUPPORTED_UPLOAD_TYPES = Object.keys(uploadTypes);

export async function validateProductImageFile(file: File, maxBytes = env.MAX_UPLOAD_BYTES) {
  if (file.size > maxBytes) {
    throw new HttpError(413, "UPLOAD_TOO_LARGE", `File terlalu besar. Maksimal ${Math.floor(maxBytes / 1024 / 1024)}MB.`);
  }

  const config = uploadTypes[file.type as keyof typeof uploadTypes];
  if (!config) {
    throw new HttpError(415, "UNSUPPORTED_UPLOAD_TYPE", "Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!config.matches(header)) {
    throw new HttpError(415, "UNSUPPORTED_UPLOAD_TYPE", "Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }

  return {
    content: await file.arrayBuffer(),
    extension: config.extension,
    contentType: file.type
  };
}

function getSupabaseStorageClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(503, "STORAGE_UNAVAILABLE", "Storage sementara tidak tersedia. Coba lagi.");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function uploadProductImage({ alt, file, productSlug }: UploadProductImageInput) {
  const supabase = getSupabaseStorageClient();
  const { content, contentType, extension } = await validateProductImageFile(file);
  const storagePath = `products/${slugify(productSlug)}/${crypto.randomUUID()}.${extension}`;

  try {
    const { error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, content, {
        contentType,
        cacheControl: "31536000",
        upsert: false
      });

    if (error) {
      throw new HttpError(502, "STORAGE_UPLOAD_FAILED", "Upload gagal di storage. Coba lagi.");
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(503, "STORAGE_UNAVAILABLE", "Storage sementara tidak tersedia. Coba lagi.");
  }

  const { data } = supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
    alt: alt ?? productSlug
  };
}

export async function deleteProductImageFiles(storagePaths: string[]) {
  const paths = Array.from(new Set(storagePaths.filter(Boolean)));
  if (!paths.length || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const supabase = getSupabaseStorageClient();
    const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove(paths);
    if (error) console.warn("[storage-cleanup]", error.message);
  } catch (error) {
    console.warn("[storage-cleanup]", error instanceof Error ? error.message : "Storage cleanup failed.");
  }
}
