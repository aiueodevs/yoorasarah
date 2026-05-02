export type StockColorInput = {
  id?: string | null;
  name: string;
  displayOrder?: number;
};

export type StockVariantInput = {
  colorVariantId?: string | null;
  colorName: string;
  colorKey?: string;
  size: string;
  stock: number;
  displayOrder?: number;
};

export type NormalizedStockVariant = {
  colorVariantId: string | null;
  colorName: string;
  colorKey: string;
  size: string;
  stock: number;
  displayOrder: number;
};

export function normalizeOptionKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function splitProductSizes(sizes: string) {
  return sizes.split("/").map((size) => size.trim()).filter(Boolean);
}

export function colorKeyForVariant(input: { colorVariantId?: string | null; colorName: string }) {
  return input.colorVariantId ? `variant:${input.colorVariantId}` : `name:${normalizeOptionKey(input.colorName)}`;
}

export function stockKeyForSelection(input: { colorVariantId?: string | null; colorName: string; size: string }) {
  return `${colorKeyForVariant(input)}::${input.size.trim()}`;
}

export function buildEvenStockVariants(input: {
  totalStock: number;
  sizes: string;
  colorVariants: StockColorInput[];
}): NormalizedStockVariant[] {
  const sizes = splitProductSizes(input.sizes);
  const colors = input.colorVariants.length
    ? [...input.colorVariants].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    : [{ id: null, name: "Default", displayOrder: 0 }];

  const combinations = colors.flatMap((color) => sizes.map((size) => ({ color, size })));
  if (!combinations.length) return [];

  const total = Math.max(0, Math.floor(input.totalStock));
  const baseStock = Math.floor(total / combinations.length);
  const remainder = total % combinations.length;

  return combinations.map(({ color, size }, index) => ({
    colorVariantId: color.id ?? null,
    colorName: color.name,
    colorKey: colorKeyForVariant({ colorVariantId: color.id, colorName: color.name }),
    size,
    stock: baseStock + (index < remainder ? 1 : 0),
    displayOrder: index
  }));
}

export function totalStock(stockVariants: Array<Pick<NormalizedStockVariant, "stock">>) {
  return stockVariants.reduce((sum, item) => sum + Math.max(0, Math.floor(item.stock)), 0);
}

export function findStockForSelection<T extends { colorVariantId?: string | null; colorName: string; colorKey: string; size: string; stock: number }>(
  stockVariants: T[],
  input: { colorVariantId?: string | null; colorName: string; size: string }
) {
  const colorKey = colorKeyForVariant(input);
  const size = input.size.trim();
  return stockVariants.find((variant) => variant.colorKey === colorKey && variant.size === size)?.stock ?? 0;
}
