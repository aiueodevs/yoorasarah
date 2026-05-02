export type ProductColorVariant = {
  id?: string;
  name: string;
  hex: string;
  gallery: string[];
};

export type ProductStockVariant = {
  colorVariantId?: string;
  colorName: string;
  colorKey: string;
  size: string;
  stock: number;
};

export type Product = {
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
  colorVariants?: ProductColorVariant[];
  stockVariants: ProductStockVariant[];
  sizes: string;
  stock: number;
  badge?: string;
  gallery?: string[];
  description?: string[];
  materials?: string[];
  care?: string[];
  salesCount: number;
  isBestSeller: boolean;
  publishedAt: string;
};

export type ProductSearchSort = "newest" | "price-asc" | "price-desc" | "best-seller";

export type ProductSearchResult = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  q: string;
  categorySlug: string;
  sort: ProductSearchSort;
};

export type ApiCartItem = {
  id: string;
  productId: string;
  colorVariantId?: string;
  product: Product;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type ApiCart = {
  items: ApiCartItem[];
  totalQuantity: number;
  subtotal: number;
};

export type CartItemUpdateInput = {
  colorVariantId?: string;
  colorName?: string;
  size?: string;
  quantity?: number;
};

export type ApiWishlistItem = {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
};

export type ApiWishlist = {
  items: ApiWishlistItem[];
  productIds: string[];
  total: number;
};

export type CategoryRoute = {
  title: string;
  subtitle: string;
  countLabel: string;
  products: Product[];
};

export type ApiCategory = {
  name: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  countLabel: string;
  productCount: number;
};

const configuredApiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export function getApiBaseUrl() {
  if (configuredApiBaseUrl) return configuredApiBaseUrl;
  if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:4000`;
  return "http://localhost:4000";
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "API request failed" }));
    throw new Error(payload.message ?? `API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) });
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}

export async function getProducts() {
  const payload = await apiGet<{ data: Product[] }>("/api/products");
  return payload.data;
}

export async function getProduct(leafSlug: string) {
  const payload = await apiGet<{ data: Product }>(`/api/products/${encodeURIComponent(leafSlug)}`);
  return payload.data;
}

export async function getCategories() {
  const payload = await apiGet<{ data: ApiCategory[] }>("/api/categories");
  return payload.data;
}

export async function getCategoryProducts(categorySlug: string) {
  const payload = await apiGet<{ data: { category: ApiCategory; products: Product[] } }>(`/api/categories/${categorySlug}/products`);
  return payload.data;
}

export async function getNewArrivalProducts() {
  const payload = await apiGet<{ data: Product[] }>("/api/collections/new-arrival");
  return payload.data;
}

export async function getBestSellerProducts() {
  const payload = await apiGet<{ data: Product[] }>("/api/collections/best-seller");
  return payload.data;
}

export async function searchProducts(params: {
  q?: string;
  categorySlug?: string;
  sort?: ProductSearchSort;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const payload = await apiGet<{ data: ProductSearchResult }>(`/api/search/products${query.size ? `?${query}` : ""}`);
  return payload.data;
}

export async function getCart() {
  const payload = await apiGet<{ data: ApiCart }>("/api/cart");
  return payload.data;
}

export async function addCartItem(input: { productId: string; colorVariantId?: string; colorName: string; size: string; quantity: number }) {
  const payload = await apiPost<{ data: ApiCart }>("/api/cart/items", input);
  return payload.data;
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  const payload = await apiPatch<{ data: ApiCart }>(`/api/cart/items/${encodeURIComponent(id)}`, { quantity });
  return payload.data;
}

export async function updateCartItem(id: string, input: CartItemUpdateInput) {
  const payload = await apiPatch<{ data: ApiCart }>(`/api/cart/items/${encodeURIComponent(id)}`, input);
  return payload.data;
}

export async function removeCartItem(id: string) {
  const payload = await apiDelete<{ data: ApiCart }>(`/api/cart/items/${encodeURIComponent(id)}`);
  return payload.data;
}

export async function clearCart() {
  const payload = await apiDelete<{ data: ApiCart }>("/api/cart");
  return payload.data;
}

export async function getWishlist() {
  const payload = await apiGet<{ data: ApiWishlist }>("/api/wishlist");
  return payload.data;
}

export async function addWishlistItem(productId: string) {
  const payload = await apiPost<{ data: ApiWishlist }>("/api/wishlist/items", { productId });
  return payload.data;
}

export async function removeWishlistItem(productId: string) {
  const payload = await apiDelete<{ data: ApiWishlist }>(`/api/wishlist/items/${encodeURIComponent(productId)}`);
  return payload.data;
}

export type CustomerSession = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
  };
  shoppingSessionId: string | null;
};

export async function getCustomerMe() {
  const payload = await apiGet<{ data: CustomerSession | null }>("/api/customer/me");
  return payload.data;
}

export async function attachCustomerSession() {
  const payload = await apiPost<{ data: { shoppingSessionId: string } }>("/api/customer/session/attach", {});
  return payload.data;
}

export async function createGuestSession() {
  const payload = await apiPost<{ data: { shoppingSessionId: string } }>("/api/customer/session/guest", {});
  return payload.data;
}

export async function getAllProductsRoute(): Promise<CategoryRoute> {
  const products = await getProducts();
  return {
    title: "Semua Produk Yoora Sarah",
    subtitle: "Seluruh pilihan Yoora Sarah dalam satu halaman. Jelajahi dress, abaya, hijab, khimar, pashmina, kids, footwear, aksesori, dan essentials dari satu katalog lengkap.",
    countLabel: `${products.length} Produk`,
    products
  };
}

export async function getCollectionRoute(type: "new-arrival" | "best-seller"): Promise<CategoryRoute> {
  const products = type === "new-arrival" ? await getNewArrivalProducts() : await getBestSellerProducts();

  if (type === "new-arrival") {
    return {
      title: "Baru datang, siap dimiliki.",
      subtitle: "Produk terbaru dengan tone studio yang lembut dan potongan yang sudah dikurasi. Pilihan segar untuk menyempurnakan koleksi Anda.",
      countLabel: `${products.length} Produk`,
      products
    };
  }

  return {
    title: "Best Seller Yoora Sarah",
    subtitle: "Pilihan produk favorit yang paling banyak diminati dari koleksi Yoora Sarah.",
    countLabel: `${products.length} Produk`,
    products
  };
}

export async function getCategoryRoute(categorySlug: string): Promise<CategoryRoute> {
  const { category, products } = await getCategoryProducts(categorySlug);
  return {
    title: category.title || category.name,
    subtitle: category.description || "-",
    countLabel: `${products.length} Produk`,
    products
  };
}

export function parsePrice(price: string) {
  return Number(price.replace(/[^\d]/g, ""));
}

export function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}
