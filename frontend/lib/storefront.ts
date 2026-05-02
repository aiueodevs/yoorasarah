import type { Product, ProductColorVariant } from "./api";

export type MegaPanelName = "produk";

export type MegaMenuIconName =
  | "dress"
  | "abaya"
  | "oneSet"
  | "hijab"
  | "khimar"
  | "pashmina"
  | "daily"
  | "event"
  | "family"
  | "footwear"
  | "accessories"
  | "essentials"
  | "celebration"
  | "formal"
  | "familyEdit"
  | "bestSeller"
  | "newArrival"
  | "styling";

export type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

export type CartItem = {
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

export const initialCart: CartItem[] = [];

export const categoryAliases: Record<string, string> = {
  "/abaya": "/abaya-2481",
  "/hijab": "/hijab-1544",
  "/khimar": "/khimar-5295",
  "/pashmina": "/pashmina-2310",
  "/kids": "/kids-9967",
  "/footwear": "/footwear-8675",
  "/accessories": "/accessories-4472",
  "/essentials": "/essentials-7002"
};

export const searchCategories = ["Semua", "Dress", "Abaya", "Khimar", "Pashmina", "Hijab", "Footwear", "Accessories", "Kids", "Essentials", "One Set"];
export const promptChips = ["Dress pesta warna moka", "Abaya warna netral", "Khimar untuk harian", "Pashmina ringan"];
export const colorNames = ["Dark Maroon", "Cappucino", "Dusty Pink", "Plum", "Mauve", "Aubergine", "Ivory", "Taupe"];

export const stylistTicker = [
  "BINGUNG PADU PADAN WARNA? TANYA AI STYLIST PREMIUM KAMI UNTUK REKOMENDASI GAYA TERBAIK",
  "TEMUKAN GAYA PERSONALMU YANG ELEGAN DENGAN ASISTEN FASHION PINTAR YOORA SARAH",
  "DAPATKAN SARAN PADU PADAN BUSANA EKSKLUSIF DENGAN FITUR AI STYLIST PREMIUM",
  "JADIKAN SETIAP PENAMPILAN MEMUKAU DENGAN REKOMENDASI CERDAS AI STYLIST"
];

export const menuPanels: Record<
  MegaPanelName,
  {
    groups: Array<{
      title: string;
      links: Array<{ href: string; icon: MegaMenuIconName; title: string; description: string }>;
    }>;
    feature: { href: string; image: string; label: string; title: string; description: string };
  }
> = {
  produk: {
    groups: [
      {
        title: "Perempuan",
        links: [
          { href: "/dress", icon: "dress", title: "Dress", description: "Pilihan dress anggun untuk harian dan momen spesial" },
          { href: "/abaya-2481", icon: "abaya", title: "Abaya", description: "Layer formal dengan jatuh kain yang tenang" },
          { href: "/hijab-1544", icon: "hijab", title: "Hijab", description: "Hijab rapi untuk dipakai setiap hari" },
          { href: "/khimar-5295", icon: "khimar", title: "Khimar", description: "Coverage panjang dengan tampilan lebih anggun" },
          { href: "/pashmina-2310", icon: "pashmina", title: "Pashmina", description: "Pashmina ringan yang mudah dipadukan" }
        ]
      },
      {
        title: "Kids",
        links: [
          { href: "/kids-9967", icon: "family", title: "Kids Dress", description: "Pilihan lembut untuk tampilan si kecil" },
          { href: "/kids-9967", icon: "familyEdit", title: "Family Edit", description: "Pilihan serasi untuk momen keluarga" },
          { href: "/kids-9967", icon: "celebration", title: "Mini Occasion", description: "Look manis untuk acara dan hari spesial" }
        ]
      },
      {
        title: "Koleksi",
        links: [
          { href: "/best-seller", icon: "bestSeller", title: "Best Seller", description: "Produk favorit yang paling banyak diminati" },
          { href: "/terbaru", icon: "newArrival", title: "New Arrival", description: "Koleksi baru dengan tone studio yang lembut" },
          { href: "/essentials-7002", icon: "essentials", title: "Essentials", description: "Dasar layering untuk dipakai berulang kali" },
          { href: "/accessories-4472", icon: "accessories", title: "Aksesori", description: "Detail kecil yang membuat tampilan terasa selesai" },
          { href: "/footwear-8675", icon: "footwear", title: "Sepatu", description: "Pelengkap tampilan yang tetap nyaman dipakai" }
        ]
      },
      {
        title: "One Set",
        links: [
          { href: "/one-set-5182", icon: "oneSet", title: "One Set", description: "Set lengkap yang memudahkan styling" },
          { href: "/one-set-5182", icon: "styling", title: "Styling Edit", description: "Pilihan praktis untuk look yang langsung rapi" },
          { href: "/essentials-7002", icon: "daily", title: "Daily Set", description: "Kombinasi mudah untuk rutinitas harian" }
        ]
      }
    ],
    feature: {
      href: "/dress/medina-dress-8751",
      image: "/assets/bella-dress.png",
      label: "Produk Pilihan",
      title: "Semua kategori Yoora Sarah dalam satu menu yang lebih ringkas.",
      description: "Masuk ke pilihan perempuan, kids, koleksi, dan one set tanpa memecah navigasi utama."
    }
  }
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function detailImages(product: Product, colorVariant?: ProductColorVariant) {
  if (colorVariant?.gallery.length) return colorVariant.gallery;
  return product.gallery?.length ? product.gallery : [product.image];
}

export function splitSizes(product: Product) {
  return product.sizes.split("/").map((size) => size.trim()).filter(Boolean);
}

export function productSwatches(product: Product) {
  return productColorOptions(product).map((option) => option.hex);
}

export function productColorOptions(product: Product): ProductColorVariant[] {
  const swatches = [
    "#7b3754",
    "#68513a",
    "#d6a7a5",
    "#633146",
    "#8b5d62",
    "#5e3c5e",
    "#f9faf9",
    "#62514d",
    "#999285",
    "#27314f",
    "#9d7d62",
    "#c5aeb9",
    "#c7d0d8",
    "#000000",
    "#28466c",
    "#866d5c",
    "#8b8bb1",
    "#6f6b6b"
  ];

  if (product.colorVariants?.length) return product.colorVariants;

  const stockColors = new Map<string, ProductColorVariant>();
  for (const stockVariant of product.stockVariants ?? []) {
    if (stockColors.has(stockVariant.colorKey)) continue;
    stockColors.set(stockVariant.colorKey, {
      ...(stockVariant.colorVariantId ? { id: stockVariant.colorVariantId } : {}),
      name: stockVariant.colorName,
      hex: swatches[stockColors.size % swatches.length],
      gallery: product.gallery?.length ? product.gallery : [product.image]
    });
  }

  if (stockColors.size) return Array.from(stockColors.values());

  return Array.from({ length: product.colors }, (_, index) => ({
    name: colorNames[index % colorNames.length] ?? `Warna ${index + 1}`,
    hex: swatches[index % swatches.length],
    gallery: product.gallery?.length ? product.gallery : [product.image]
  }));
}

function normalizeOptionKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function colorKeyForOption(color?: Pick<ProductColorVariant, "id" | "name">) {
  if (!color) return "";
  return color.id ? `variant:${color.id}` : `name:${normalizeOptionKey(color.name)}`;
}

export function stockForSelection(product: Product, color: ProductColorVariant | undefined, size: string) {
  const colorKey = colorKeyForOption(color);
  const stockRow = (product.stockVariants ?? []).find((item) => item.colorKey === colorKey && item.size === size);
  return stockRow?.stock ?? 0;
}

export function colorHasStock(product: Product, color: ProductColorVariant | undefined, sizes = splitSizes(product)) {
  return sizes.some((size) => stockForSelection(product, color, size) > 0);
}

export function firstAvailableSizeForColor(product: Product, color: ProductColorVariant | undefined, sizes = splitSizes(product)) {
  return sizes.find((size) => stockForSelection(product, color, size) > 0) ?? sizes[0] ?? "One Size";
}

export function firstAvailableColor(product: Product, colors = productColorOptions(product), sizes = splitSizes(product)) {
  return colors.find((color) => colorHasStock(product, color, sizes)) ?? colors[0];
}
