export const publicCacheKeys = {
  products: "products:list",
  categories: "categories:list",
  newArrival: "collections:new-arrival",
  bestSeller: "collections:best-seller"
} as const;

export const searchCachePattern = "products:search:*";

export function normalizeProductPath(path: string) {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

export function detailCacheKey(pathOrSlug: string) {
  return `products:detail:${normalizeProductPath(pathOrSlug)}`;
}

export function categoryProductsCacheKey(categorySlug: string) {
  return `categories:${categorySlug.replace(/^\/+/, "")}:products`;
}

export function searchCacheKey({
  categorySlug,
  limit,
  page,
  q,
  sort
}: {
  categorySlug?: string;
  limit: number;
  page: number;
  q?: string;
  sort: string;
}) {
  const normalizedQuery = (q ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "all";
  const normalizedCategory = (categorySlug ?? "all").replace(/^\/+/, "").toLowerCase();

  return [
    "products:search",
    `category=${normalizedCategory}`,
    `limit=${limit}`,
    `page=${page}`,
    `q=${normalizedQuery}`,
    `sort=${sort}`
  ].join(":");
}

export function cacheKeysForProductChange({ categorySlug, path }: { categorySlug?: string; path?: string }) {
  const keys: string[] = [
    publicCacheKeys.products,
    publicCacheKeys.categories,
    publicCacheKeys.newArrival,
    publicCacheKeys.bestSeller
  ];

  if (path) {
    keys.push(detailCacheKey(path));
    const leafSlug = normalizeProductPath(path).split("/").at(-1);
    if (leafSlug) keys.push(detailCacheKey(leafSlug));
  }
  if (categorySlug) keys.push(categoryProductsCacheKey(categorySlug));

  return keys;
}
