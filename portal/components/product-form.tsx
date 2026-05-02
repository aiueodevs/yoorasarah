"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type AdminProduct,
  type ProductColorVariantInput,
  type ProductImageInput,
  type ProductPayload,
  type ProductStockVariantInput
} from "../lib/api";

const categories = [
  { slug: "dress", name: "Dress" },
  { slug: "abaya-2481", name: "Abaya" },
  { slug: "hijab-1544", name: "Hijab" },
  { slug: "khimar-5295", name: "Khimar" },
  { slug: "pashmina-2310", name: "Pashmina" },
  { slug: "kids-9967", name: "Kids" },
  { slug: "footwear-8675", name: "Footwear" },
  { slug: "accessories-4472", name: "Accessories" },
  { slug: "essentials-7002", name: "Essentials" },
  { slug: "one-set-5182", name: "One Set" }
];

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadPrecheckError(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) return "File terlalu besar. Maksimal 5MB.";
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  return null;
}

type ProductFormState = {
  name: string;
  slug: string;
  categorySlug: string;
  price: string;
  sizes: string;
  salesCount: string;
  publishedAt: string;
  isBestSeller: boolean;
  isPublished: boolean;
  description: string;
  materials: string;
  care: string;
};

type EditableColorVariant = ProductColorVariantInput & {
  localId: string;
};

type StockMap = Record<string, string>;

function dateInputValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitSizes(value: string) {
  return value.split("/").map((item) => item.trim()).filter(Boolean);
}

function normalizeOptionKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function colorKey(color: EditableColorVariant) {
  return color.id ? `variant:${color.id}` : `name:${normalizeOptionKey(color.name)}`;
}

function stockMapKey(color: EditableColorVariant, size: string) {
  return `${color.localId}::${size}`;
}

function galleriesMatch(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function variantImages(product: AdminProduct, gallery: string[] = [], colorName: string): ProductImageInput[] {
  if (galleriesMatch(gallery, product.gallery ?? [])) return [];
  return gallery.map((publicUrl, index) => ({
    publicUrl,
    alt: `${product.name} ${colorName}`,
    displayOrder: index
  }));
}

function initialState(product?: AdminProduct): ProductFormState {
  return {
    name: product?.name ?? "",
    slug: product?.leafSlug ?? "",
    categorySlug: product?.categorySlug ?? "dress",
    price: String(product?.priceAmount ?? ""),
    sizes: product?.sizes ?? "S / M / L",
    salesCount: String(product?.salesCount ?? 0),
    publishedAt: dateInputValue(product?.publishedAt),
    isBestSeller: product?.isBestSeller ?? false,
    isPublished: product?.isPublished ?? true,
    description: product?.description?.join("\n") ?? "",
    materials: product?.materials?.join("\n") ?? "",
    care: product?.care?.join("\n") ?? ""
  };
}

function initialColors(product?: AdminProduct): EditableColorVariant[] {
  if (product?.colorVariants?.length) {
    return product.colorVariants.map((variant, index) => ({
      localId: variant.id ?? `color-${index}`,
      id: variant.id,
      name: variant.name,
      hex: variant.hex,
      displayOrder: index,
      images: variantImages(product, variant.gallery, variant.name)
    }));
  }

  return [{
    localId: "color-0",
    name: "Default",
    hex: "#C38775",
    displayOrder: 0,
    images: []
  }];
}

function initialStockMap(product: AdminProduct | undefined, colors: EditableColorVariant[], sizes: string[]) {
  const stockMap: StockMap = {};
  const stockRows = product?.stockVariants ?? [];

  for (const color of colors) {
    for (const size of sizes) {
      const row = stockRows.find((item) => {
        if (item.size !== size) return false;
        if (color.id && item.colorVariantId === color.id) return true;
        return item.colorName.trim().toLowerCase() === color.name.trim().toLowerCase();
      });
      stockMap[stockMapKey(color, size)] = String(row?.stock ?? 0);
    }
  }

  return stockMap;
}

function stockRowsFromMatrix(colors: EditableColorVariant[], sizes: string[], stockMap: StockMap): ProductStockVariantInput[] {
  return colors.flatMap((color, colorIndex) => sizes.map((size, sizeIndex) => ({
    ...(color.id ? { colorVariantId: color.id } : {}),
    colorName: color.name.trim() || "Default",
    colorKey: colorKey(color),
    size,
    stock: Math.max(0, Number(stockMap[stockMapKey(color, size)] ?? 0)),
    displayOrder: colorIndex * sizes.length + sizeIndex
  })));
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [state, setState] = useState<ProductFormState>(() => initialState(product));
  const [images, setImages] = useState<ProductImageInput[]>(() => (product?.gallery ?? []).map((publicUrl, index) => ({ publicUrl, alt: product?.name ?? "Produk", displayOrder: index })));
  const [colors, setColors] = useState<EditableColorVariant[]>(() => initialColors(product));
  const [stockMap, setStockMap] = useState<StockMap>(() => initialStockMap(product, initialColors(product), splitSizes(product?.sizes ?? "S / M / L")));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sizeOptions = useMemo(() => splitSizes(state.sizes), [state.sizes]);
  const stockVariants = useMemo(() => stockRowsFromMatrix(colors, sizeOptions, stockMap), [colors, sizeOptions, stockMap]);
  const totalStock = useMemo(() => stockVariants.reduce((sum, item) => sum + item.stock, 0), [stockVariants]);

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    const precheckError = uploadPrecheckError(file);
    if (precheckError) {
      setError(precheckError);
      setUploading(false);
      return;
    }

    try {
      const uploaded = await uploadProductImage(file, state.slug || state.name || "produk");
      if (!uploaded.storagePath || !uploaded.publicUrl) {
        throw new Error("Upload gagal. Storage tidak mengembalikan URL gambar.");
      }
      setImages((items) => [...items, { ...uploaded, displayOrder: items.length }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const updateColor = <K extends keyof EditableColorVariant>(localId: string, key: K, value: EditableColorVariant[K]) => {
    setColors((items) => items.map((item) => (item.localId === localId ? { ...item, [key]: value } : item)));
  };

  const addColor = () => {
    setColors((items) => [
      ...items,
      {
        localId: `color-${Date.now()}`,
        name: `Warna ${items.length + 1}`,
        hex: "#C38775",
        displayOrder: items.length,
        images: []
      }
    ]);
  };

  const removeColor = (localId: string) => {
    setColors((items) => (items.length <= 1 ? items : items.filter((item) => item.localId !== localId)));
  };

  const updateStock = (color: EditableColorVariant, size: string, value: string) => {
    setStockMap((current) => ({ ...current, [stockMapKey(color, size)]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const category = categories.find((item) => item.slug === state.categorySlug);
    const payload: ProductPayload = {
      name: state.name,
      slug: state.slug || undefined,
      categorySlug: state.categorySlug,
      categoryName: category?.name,
      price: Number(state.price),
      sizes: state.sizes,
      stock: totalStock,
      salesCount: Number(state.salesCount),
      isBestSeller: state.isBestSeller,
      isPublished: state.isPublished,
      publishedAt: new Date(state.publishedAt).toISOString(),
      colorCount: colors.length,
      description: lines(state.description),
      materials: lines(state.materials),
      care: lines(state.care),
      images: images.map((image, index) => ({ ...image, displayOrder: index })),
      colorVariants: colors.map((color, index) => ({
        id: color.id,
        name: color.name.trim() || `Warna ${index + 1}`,
        hex: color.hex,
        displayOrder: index,
        images: color.images.map((image, imageIndex) => ({ ...image, displayOrder: imageIndex }))
      })),
      stockVariants
    };

    try {
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produk gagal disimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <p className="label">{product ? "Edit Produk" : "Produk Baru"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-clay">{product ? product.name : "Tambah produk ke katalog"}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">Nama Produk</span>
            <input className="field mt-2" value={state.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
          <label>
            <span className="label">Slug</span>
            <input className="field mt-2" value={state.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="otomatis dari nama jika kosong" />
          </label>
          <label>
            <span className="label">Kategori</span>
            <select className="field mt-2" value={state.categorySlug} onChange={(event) => updateField("categorySlug", event.target.value)}>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Harga</span>
            <input className="field mt-2" type="number" min={0} value={state.price} onChange={(event) => updateField("price", event.target.value)} required />
          </label>
          <label>
            <span className="label">Ukuran</span>
            <input className="field mt-2" value={state.sizes} onChange={(event) => updateField("sizes", event.target.value)} required />
          </label>
          <div className="rounded-xl border border-line bg-blush p-3">
            <span className="label">Total Stock</span>
            <p className="mt-2 text-2xl font-bold text-clay">{totalStock}</p>
          </div>
          <label>
            <span className="label">Sales Count</span>
            <input className="field mt-2" type="number" min={0} value={state.salesCount} onChange={(event) => updateField("salesCount", event.target.value)} />
          </label>
          <label>
            <span className="label">Publish Date</span>
            <input className="field mt-2" type="date" value={state.publishedAt} onChange={(event) => updateField("publishedAt", event.target.value)} />
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-lg border border-line bg-blush p-3 text-sm font-bold text-clay">
            <input type="checkbox" checked={state.isBestSeller} onChange={(event) => updateField("isBestSeller", event.target.checked)} />
            Best Seller
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-line bg-blush p-3 text-sm font-bold text-clay">
            <input type="checkbox" checked={state.isPublished} onChange={(event) => updateField("isPublished", event.target.checked)} />
            Published
          </label>
        </div>

        <section className="mt-6 rounded-2xl border border-line bg-blush/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Warna Produk</p>
              <p className="mt-1 text-sm text-clay/60">Warna ini dipakai untuk baris stock varian.</p>
            </div>
            <button type="button" onClick={addColor} className="button-secondary px-4 py-2 text-xs">
              Tambah Warna
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {colors.map((color, index) => (
              <div key={color.localId} className="grid gap-3 rounded-xl border border-line bg-white p-3 md:grid-cols-[1fr_120px_auto]">
                <label>
                  <span className="label">Nama Warna</span>
                  <input className="field mt-2" value={color.name} onChange={(event) => updateColor(color.localId, "name", event.target.value)} />
                </label>
                <label>
                  <span className="label">Hex</span>
                  <input className="field mt-2" value={color.hex} onChange={(event) => updateColor(color.localId, "hex", event.target.value)} />
                </label>
                <div className="flex items-end gap-2">
                  <span className="mb-2 h-9 w-9 rounded-full border border-line" style={{ backgroundColor: color.hex }} />
                  <button type="button" onClick={() => removeColor(color.localId)} disabled={colors.length <= 1} className="mb-2 rounded-lg border border-line px-3 py-2 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                    Hapus
                  </button>
                </div>
                <input type="hidden" value={index} readOnly />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-4">
          <p className="label">Stock Varian</p>
          <p className="mt-1 text-sm text-clay/60">Isi stock untuk setiap kombinasi warna dan ukuran.</p>
          {sizeOptions.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-black uppercase tracking-[0.12em] text-clay/55">
                    <th className="border-b border-line px-3 py-3">Warna</th>
                    {sizeOptions.map((size) => (
                      <th key={size} className="border-b border-line px-3 py-3 text-center">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color) => (
                    <tr key={color.localId}>
                      <td className="border-b border-line px-3 py-3">
                        <span className="inline-flex items-center gap-2 font-bold text-clay">
                          <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                          {color.name || "Default"}
                        </span>
                      </td>
                      {sizeOptions.map((size) => (
                        <td key={size} className="border-b border-line px-3 py-3">
                          <input
                            className="field mx-auto h-10 w-24 px-2 py-1 text-center"
                            type="number"
                            min={0}
                            value={stockMap[stockMapKey(color, size)] ?? "0"}
                            onChange={(event) => updateStock(color, size, event.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-line bg-blush p-3 text-sm text-clay/70">Isi field ukuran dulu agar matrix stock muncul.</p>
          )}
        </section>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="label">Deskripsi Produk</span>
            <textarea className="field mt-2 min-h-28" value={state.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Satu paragraf per baris" />
          </label>
          <label>
            <span className="label">Bahan & Detail</span>
            <textarea className="field mt-2 min-h-24" value={state.materials} onChange={(event) => updateField("materials", event.target.value)} placeholder="Satu poin per baris" />
          </label>
          <label>
            <span className="label">Perawatan</span>
            <textarea className="field mt-2 min-h-24" value={state.care} onChange={(event) => updateField("care", event.target.value)} placeholder="Satu poin per baris" />
          </label>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-soft">
        <p className="label">Gambar Produk</p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-clay/30 bg-blush px-4 py-8 text-center text-sm font-semibold text-clay">
          {uploading ? "Mengupload..." : "Upload ke Supabase"}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              const input = event.currentTarget;
              if (file) void upload(file).finally(() => {
                input.value = "";
              });
            }}
          />
        </label>
        <div className="mt-4 grid gap-3">
          {images.map((image, index) => (
            <div key={`${image.publicUrl}-${index}`} className="flex gap-3 rounded-lg border border-line p-2">
              <div className="relative h-20 w-16 overflow-hidden rounded bg-blush">
                <Image src={image.publicUrl} alt={image.alt ?? state.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-clay">{image.publicUrl}</p>
                <button type="button" onClick={() => setImages((items) => items.filter((_, imageIndex) => imageIndex !== index))} className="mt-3 text-xs font-bold text-red-700">
                  Hapus gambar
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && <p className="rounded-lg border border-line bg-blush p-3 text-sm text-clay/70">Belum ada gambar. Upload minimal satu gambar agar produk tampil bagus di frontend.</p>}
        </div>

        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="button-primary mt-5 w-full">
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </aside>
    </form>
  );
}
