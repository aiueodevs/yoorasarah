import { productColorVariantsBySlug } from "./product-color-variants";

export type ProductColorVariant = {
  name: string;
  hex: string;
  gallery: string[];
};

export type Product = {
  name: string;
  slug: string;
  category: string;
  price: string;
  image: string;
  colors: number;
  colorVariants?: ProductColorVariant[];
  sizes: string;
  stock?: number;
  badge?: string;
  gallery?: string[];
  description?: string[];
  materials?: string[];
  care?: string[];
};

export type CategoryRoute = {
  title: string;
  subtitle: string;
  countLabel: string;
  products: Product[];
};

const baseProducts: Product[] = [
  { name: "Clara Dress", slug: "/dress/clara-dress-5254", category: "Dress", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg", colors: 17, sizes: "XL / S / L / M", stock: 163, badge: "Best Seller", materials: ["Material Berkualitas Tinggi", "Busui Friendly", "Detail Elegan & Feminin", "Pilihan Ukuran & Warna Lengkap"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Yoora Dress", slug: "/dress/yoora-dress-9662", category: "Dress", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg", colors: 14, sizes: "S / L / M", stock: 209, badge: "Best Seller", materials: ["Material Sora Anti UV", "Aksen Kupu-Kupu & Permata", "Resleting Custom Logo Yoora Sarah", "Saku di Bagian Kanan"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Bella Dress", slug: "/dress/bella-dress-4179", category: "Dress", price: "Rp419.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png", colors: 22, sizes: "XL / S / M / L", stock: 2031, badge: "Best Seller", materials: ["Material Premium"], care: ["Cuci lembut"] },
  {
    name: "Medina Dress",
    slug: "/dress/medina-dress-8751",
    category: "Dress",
    price: "Rp179.999",
    image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg",
    colors: 14,
    colorVariants: [
      { name: "Jett Black", hex: "#000000", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg"] },
      { name: "Caramel", hex: "#622c1f", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034508_a6da77b7.jpg"] },
      { name: "Denim", hex: "#8788ab", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034509_113557e0.jpg"] },
      { name: "Dark Teal", hex: "#25395c", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034507_08062580.jpg"] },
      { name: "Black", hex: "#000000", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034504_846da750.jpg"] },
      { name: "Bitter Coklat", hex: "#433a3f", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034509_f58f4ae8.jpg"] },
      { name: "Dark Maroon", hex: "#71384e", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034509_855219b0.jpg"] },
      { name: "Ash Blue", hex: "#9590a6", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_040123_9a5470cb.jpg"] },
      { name: "Taro", hex: "#71586d", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034505_985b6cc1.jpg"] },
      { name: "Broken White", hex: "#ffffff", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034507_9bbe12fa.jpeg"] },
      { name: "Sage Green", hex: "#aaab9d", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034508_226158a7.jpg"] },
      { name: "Mocha", hex: "#6b5f5f", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034509_5f83fe81.jpg"] },
      { name: "Carafe", hex: "#614e39", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034510_d80fc22e.jpg"] },
      { name: "Sea Storm", hex: "#2e425b", gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034511_3215a8d6.jpg"] }
    ],
    sizes: "XL / S / L / M",
    stock: 134,
    description: [
      "Medina Dress adalah gaun elegan yang dirancang untuk menghadirkan tampilan anggun dan berkelas dalam setiap kesempatan. Menggunakan bahan khas Yorleza, dress ini menawarkan kenyamanan maksimal dengan kualitas premium yang diproses secara khusus oleh Yoora Sarah.",
      "Dengan karakter kain yang jatuh indah dan terasa adem, Medina Dress menjadi pilihan tepat untuk momen spesial maupun penggunaan sehari-hari yang tetap ingin terlihat rapi dan elegan."
    ],
    materials: ["Material Yorleza", "Tidak Menerawang", "Tidak Mudah Kusut", "Adem & Tidak Gerah", "Tekstur Jatuh & Flowing", "Cocok untuk Berbagai Kesempatan"],
    care: ["Cuci dengan lembut", "Setrika suhu rendah"]
  },
  { name: "Safiyyah Sora Dress", slug: "/dress/safiyyah-sora-dress-5068", category: "Dress", price: "Rp359.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070441_013b9d19.jpg", colors: 25, sizes: "XL / S / L / M", stock: 1103, gallery: ["https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070441_013b9d19.jpg", "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070442_3428670b.png", "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070442_1358e825.png", "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070443_12f4f454.png", "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_070443_4e178181.png"], description: ["Safiyyah Dress adalah gaun muslimah syar'i yang memadukan keanggunan dan kenyamanan dalam satu balutan. Terbuat dari bahan Sora Premium Anti UV dengan perlindungan UVP 50+, dress ini terasa lembut, adem, dan ringan saat dikenakan, sekaligus membantu melindungi kulit dari paparan sinar matahari sehingga nyaman dipakai sepanjang hari.", "Dirancang dengan model syar'i berpotongan longgar, Safiyyah Dress memberikan tampilan tertutup yang tidak membentuk tubuh namun tetap anggun dan sopan sesuai syariat."], materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Yume Striped Dress", slug: "/dress/yume-striped-dress-5604", category: "Dress", price: "Rp315.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260124_074833_078e6158.jpg", colors: 11, sizes: "XL / S / L / M", stock: 0, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Medina Poka Dress", slug: "/dress/medina-poka-dress-9582", category: "Dress", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_154356_61816bf3.jpeg", colors: 4, sizes: "XL / S / L / M", stock: 26, materials: ["Material Poka Eksklusif", "Tidak Menerawang", "Anti Kusut", "Nyaman & Adem"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "PO Lianhua Abaya", slug: "/abaya-2481/po-lianhua-abaya-8765", category: "Abaya", price: "Rp329.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260403_021220_bc6b416f.png", colors: 5, sizes: "S / L / M", stock: 0, badge: "Best Seller", materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Beyza Abaya", slug: "/abaya-2481/beyza-abaya-9167", category: "Abaya", price: "Rp479.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260325_070402_8f11d867.png", colors: 11, sizes: "S / L / M", stock: 428, badge: "Best Seller", materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Talia Denim Abaya", slug: "/abaya-2481/talia-denim-abaya-8738", category: "Abaya", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_223111_c6ca149f.jpeg", colors: 7, sizes: "S / L / M", stock: 157, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Bloom Love Abaya", slug: "/abaya-2481/bloom-love-abaya-5945", category: "Abaya", price: "Rp189.900", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_073353_66bb64d1.jpg", colors: 8, sizes: "S / L / M", stock: 66, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Bloom Flower Abaya", slug: "/abaya-2481/bloom-flower-abaya-3855", category: "Abaya", price: "Rp189.900", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_071325_e654996c.jpg", colors: 8, sizes: "S / L / M", stock: 91, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Zippa Abaya", slug: "/abaya-2481/zippa-abaya-3494", category: "Abaya", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_024617_52e28445.jpg", colors: 4, sizes: "S / L / M", stock: 20, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Khimar Medina", slug: "/khimar-5295/khimar-medina-7607", category: "Khimar", price: "Rp99.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_074622_0c9ed77d.JPG", colors: 6, sizes: "All Size", stock: 50, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Madiha Square Ban", slug: "/khimar-5295/madiha-square-ban-1165", category: "Khimar", price: "Rp89.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260417_070119_0bda4caf.JPG", colors: 20, sizes: "All Size", stock: 433, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "French Khimar Armuzna", slug: "/khimar-5295/french-khimar-armuzna-1902", category: "Khimar", price: "Rp299.900", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_045745_c001e688.jpg", colors: 15, sizes: "All Size", stock: 233, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Serene Pashmina Curve", slug: "/pashmina-2310/serene-pashmina-curve-4121", category: "Pashmina", price: "Rp99.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_034207_b9334818.jpg", colors: 21, sizes: "All Size", stock: 931, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Naura Oval", slug: "/hijab-1544/naura-oval-8249", category: "Hijab", price: "Rp59.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260329_034606_37ba4148.jpeg", colors: 30, sizes: "All Size", stock: 703, materials: ["Desain Oval yang Elegan", "Material Ceruty Babydoll", "Ukuran All Size +/-135 x 135 cm"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Bergo Syar'i", slug: "/hijab-1544/bergo-syar-i-6103", category: "Hijab", price: "Rp119.900", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260401_023324_60cc45fa.jpeg", colors: 31, sizes: "XL / L / M", stock: 475, badge: "Best Seller", materials: ["Desain Jumbo 2 Layer", "Material Ceruty Babydoll Premium", "Pilihan Ukuran"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Lilly Heels", slug: "/footwear-8675/lilly-heels-5144", category: "Footwear", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260325_030415_7cadf7c8.jpeg", colors: 3, sizes: "39 / 38 / 41 / 36 / 40 / 37", stock: 156, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Levine Boots", slug: "/footwear-8675/levine-boots-7964", category: "Footwear", price: "Rp224.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260325_031815_267410a2.JPG", colors: 3, sizes: "39 / 38 / 41 / 40 / 37", stock: 129, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Bross Yoora Sarah", slug: "/accessories-4472/bross-yoora-sarah-5731", category: "Accessories", price: "Rp79.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260325_034055_775c49b6.jpeg", colors: 3, sizes: "All Size", stock: 282, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Tote Bag", slug: "/accessories-4472/tote-bag-4878", category: "Accessories", price: "Rp199.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_094020_a5d27553.jpg", colors: 3, sizes: "All Size", stock: 275, materials: ["Kanvas tebal dengan kapasitas luas"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Azalia Kids", slug: "/kids-9967/azalia-kids-7008", category: "Kids", price: "Rp154.224", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_040252_3ab42348.jpg", colors: 14, sizes: "XL / S / L / M / XXL", stock: 127, materials: ["Material Knit Seline Premium", "Detail Renda & Rempel", "Model Fleksibel"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] },
  { name: "Bella Kids Dress", slug: "/kids-9967/bella-kids-dress-4339", category: "Kids", price: "Rp363.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260315_073228_a2871e45.png", colors: 11, sizes: "XL / S / L / M / XXL / XXXL", stock: 0, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Yume Striped Kids Dress", slug: "/kids-9967/yume-striped-kids-dress-6561", category: "Kids", price: "Rp260.000", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260222_080739_f0387b5b.jpg", colors: 11, sizes: "XL / S / L / M / XXL / XXXL", stock: 0, materials: ["Material Premium"], care: ["Cuci lembut"] },
  { name: "Yuki Inner Busui", slug: "/essentials-7002/yuki-inner-busui-9999", category: "Essentials", price: "Rp89.999", image: "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_095908_2ca8b5b6.jpg", colors: 3, sizes: "All Size", stock: 102, materials: ["Material Viscose yang Adem & Lembut", "Desain Busui Praktis", "Nyaman untuk Layering", "Cutting Rapi & Fleksibel"], care: ["Cuci dengan lembut", "Setrika suhu rendah"] }
];

export const products: Product[] = baseProducts.map((product) => {
  const colorVariants = productColorVariantsBySlug[product.slug] ?? product.colorVariants;

  if (!colorVariants?.length) return product;

  return {
    ...product,
    colors: colorVariants.length,
    colorVariants
  };
});

const bestSellerProducts = products.filter((product) => product.badge === "Best Seller");

export const categoryRoutes: Record<string, CategoryRoute> = {
  "/produk": { title: "Semua Produk Yoora Sarah", subtitle: "Seluruh pilihan Yoora Sarah dalam satu halaman. Jelajahi dress, abaya, hijab, khimar, pashmina, kids, footwear, aksesori, dan essentials dari satu katalog lengkap.", products, countLabel: `${products.length} Produk` },
  "/best-seller": { title: "Best Seller Yoora Sarah", subtitle: "Pilihan produk favorit yang paling banyak diminati dari koleksi Yoora Sarah.", products: bestSellerProducts, countLabel: `${bestSellerProducts.length} Produk` },
  "/terbaru": { title: "Baru datang, siap dimiliki.", subtitle: "Produk terbaru dengan tone studio yang lembut dan potongan yang sudah dikurasi. Pilihan segar untuk menyempurnakan koleksi Anda.", products, countLabel: "27 Produk" },
  "/dress": { title: "Dress", subtitle: "Setiap Dress Memiliki Ceritanya", products: products.filter((p) => p.category === "Dress"), countLabel: "7 Produk" },
  "/abaya-2481": { title: "Abaya", subtitle: "-", products: products.filter((p) => p.category === "Abaya"), countLabel: "6 Produk" },
  "/hijab-1544": { title: "Hijab", subtitle: "Pilihan hijab yang rapi untuk setiap hari.", products: products.filter((p) => p.category === "Hijab"), countLabel: "2 Produk" },
  "/khimar-5295": { title: "Khimar", subtitle: "Coverage panjang dengan tampilan yang anggun.", products: products.filter((p) => p.category === "Khimar"), countLabel: "3 Produk" },
  "/pashmina-2310": { title: "Pashmina", subtitle: "Pashmina ringan yang mudah dipadukan.", products: products.filter((p) => p.category === "Pashmina"), countLabel: "1 Produk" },
  "/kids-9967": { title: "Kids", subtitle: "Busana Manis untuk Momen Si Kecil", products: products.filter((p) => p.category === "Kids"), countLabel: "3 Produk" },
  "/footwear-8675": { title: "Footwear", subtitle: "Pelengkap tampilan yang tetap nyaman dipakai.", products: products.filter((p) => p.category === "Footwear"), countLabel: "2 Produk" },
  "/accessories-4472": { title: "Accessories", subtitle: "Detail kecil yang membuat look terasa selesai.", products: products.filter((p) => p.category === "Accessories"), countLabel: "2 Produk" },
  "/essentials-7002": { title: "Essentials", subtitle: "Produk dasar untuk layering sehari-hari.", products: products.filter((p) => p.category === "Essentials"), countLabel: "1 Produk" }
};

export const navItems = [
  { label: "Terbaru", href: "/terbaru" },
  { label: "Kids", href: "/kids-9967" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Stylist", href: "/stylist" },
  { label: "One Set", href: "/one-set-5182", pill: true }
];

export const tickerItems = [
  "GRATIS ONGKIR PILIHAN | TEMUKAN PRODUK DENGAN PROMO KIRIM GRATIS MINGGU INI",
  "PRODUK PROMO HARI INI | CEK BEST SELLER DENGAN HARGA YANG LEBIH HEMAT",
  "PAKET HEMAT ONE SET | AMBIL LOOK LENGKAP DENGAN PENAWARAN SET PILIHAN",
  "BELANJA LEBIH RINGAN | JELAJAHI KOLEKSI FAVORIT DAN NIKMATI PROMO SPESIAL HARI INI",
  "STOK TERBATAS | SIMPAN PRODUK INCARAN KE FAVORIT SEBELUM UKURAN HABIS"
];

export const stylistTicker = [
  "BINGUNG PADU PADAN WARNA? TANYA AI STYLIST PREMIUM KAMI UNTUK REKOMENDASI GAYA TERBAIK",
  "TEMUKAN GAYA PERSONALMU YANG ELEGAN DENGAN ASISTEN FASHION PINTAR YOORA SARAH",
  "DAPATKAN SARAN PADU PADAN BUSANA EKSKLUSIF DENGAN FITUR AI STYLIST PREMIUM",
  "JADIKAN SETIAP PENAMPILAN MEMUKAU DENGAN REKOMENDASI CERDAS AI STYLIST"
];

export const swatches = [
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

export function normalizePath(path: string) {
  if (!path || path === "/index.html") return "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function findProduct(path: string) {
  const clean = normalizePath(path);
  return products.find((item) => item.slug === clean) ?? products.find((item) => clean.includes(item.slug.split("/").pop() ?? ""));
}

export function parsePrice(price: string) {
  return Number(price.replace(/[^\d]/g, ""));
}

export function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}
