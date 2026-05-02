import { apiBaseUrl } from "./config";

export type ProductImageInput = {
  storagePath?: string | null;
  publicUrl: string;
  alt?: string | null;
  displayOrder?: number;
};

export type ProductColorVariantInput = {
  id?: string;
  name: string;
  hex: string;
  displayOrder?: number;
  images: ProductImageInput[];
};

export type AdminProductColorVariant = {
  id?: string;
  name: string;
  hex: string;
  displayOrder?: number;
  gallery: string[];
};

export type ProductStockVariantInput = {
  colorVariantId?: string;
  colorName: string;
  colorKey?: string;
  size: string;
  stock: number;
  displayOrder?: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  leafSlug: string;
  category: string;
  categorySlug: string;
  price: string;
  priceAmount: number;
  image: string;
  colors: number;
  colorVariants?: AdminProductColorVariant[];
  sizes: string;
  stock: number;
  stockVariants: ProductStockVariantInput[];
  badge?: string;
  gallery?: string[];
  description?: string[];
  materials?: string[];
  care?: string[];
  salesCount: number;
  isBestSeller: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMe = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type ProductPayload = {
  name: string;
  slug?: string;
  categorySlug: string;
  categoryName?: string;
  price: number;
  colorCount?: number;
  sizes: string;
  stock: number;
  isBestSeller: boolean;
  isPublished: boolean;
  salesCount: number;
  publishedAt?: string;
  description?: string[];
  materials?: string[];
  care?: string[];
  images?: ProductImageInput[];
  colorVariants?: ProductColorVariantInput[];
  stockVariants?: ProductStockVariantInput[];
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(payload.message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export async function getAdminProducts() {
  const payload = await request<{ data: AdminProduct[] }>("/api/admin/products");
  return payload.data;
}

export async function getAdminMe() {
  const payload = await request<{ data: AdminMe }>("/api/admin/me");
  return payload.data;
}

export async function getAdminProduct(id: string) {
  const payload = await request<{ data: AdminProduct }>(`/api/admin/products/${id}`);
  return payload.data;
}

export async function createProduct(payload: ProductPayload) {
  const response = await request<{ data: AdminProduct }>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const response = await request<{ data: AdminProduct }>(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function updateProductStock(id: string, stockVariants: ProductStockVariantInput[]) {
  const response = await request<{ data: AdminProduct }>(`/api/admin/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stockVariants })
  });
  return response.data;
}

export async function deleteProduct(id: string) {
  await request<{ data: { deleted: boolean } }>(`/api/admin/products/${id}`, {
    method: "DELETE"
  });
}

export async function uploadProductImage(file: File, productSlug: string) {
  const form = new FormData();
  form.set("file", file);
  form.set("productSlug", productSlug);
  form.set("alt", productSlug);

  const response = await request<{ data: ProductImageInput }>("/api/admin/uploads", {
    method: "POST",
    body: form
  });

  return response.data;
}
