export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function leafSlugFromPath(path: string) {
  return path.replace(/\/+$/, "").split("/").filter(Boolean).at(-1) ?? slugify(path);
}

export function categorySlugFromPath(path: string) {
  return path.split("/").filter(Boolean)[0] ?? "produk";
}

export function parsePriceToAmount(value: number | string) {
  if (typeof value === "number") return value;
  return Number(value.replace(/[^\d]/g, ""));
}
