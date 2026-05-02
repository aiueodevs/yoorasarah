"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { deleteProduct, getAdminProducts, type AdminProduct } from "../lib/api";

export function ProductsDashboard() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getAdminProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => `${product.name} ${product.category} ${product.slug}`.toLowerCase().includes(normalized));
  }, [products, query]);

  const remove = async (product: AdminProduct) => {
    if (!confirm(`Hapus ${product.name}?`)) return;
    await deleteProduct(product.id);
    setProducts((items) => items.filter((item) => item.id !== product.id));
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label">Portal Produk</p>
          <h1 className="mt-2 text-2xl font-bold text-clay sm:text-3xl">Dashboard</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={load} className="button-secondary justify-between gap-6">
            Action <span>›</span>
          </button>
          <Link href="/products" className="button-secondary justify-between gap-6">
            List on Marketplace <span>›</span>
          </Link>
          <Link href="/products/new" className="button-primary justify-between gap-6">
            Add New <span>›</span>
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-[22px] border border-line bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <label className="field flex items-center gap-3 md:max-w-sm">
            <span className="text-clay/45">⌕</span>
            <input className="w-full border-0 bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, slug, atau kategori" />
          </label>
          <div className="flex items-center gap-2 text-xs font-semibold text-clay/55">
            <span>{filtered.length} produk</span>
            <button type="button" onClick={load} className="rounded-lg border border-line bg-blush px-3 py-2 text-clay transition hover:border-clay">
              Refresh
            </button>
          </div>
        </div>

        {loading && <p className="p-5 text-sm text-clay/70">Mengambil produk...</p>}
        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold">{error}</p>
            <p className="mt-1">Pastikan backend menyala, database sudah migrate/seed, dan sesi admin valid.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-blush/70 text-[11px] font-black uppercase tracking-[0.12em] text-clay/60">
                  <th className="w-12 rounded-tl-[20px] px-4 py-4">
                    <input type="checkbox" aria-label="Pilih semua produk" className="h-4 w-4 rounded border-line accent-clay" />
                  </th>
                  <th className="px-3 py-4">SKU</th>
                  <th className="px-3 py-4">Image</th>
                  <th className="px-3 py-4">Title</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">QTY</th>
                  <th className="px-3 py-4">Warehouse</th>
                  <th className="px-3 py-4">Price</th>
                  <th className="px-3 py-4">Last Modified</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="rounded-tr-[20px] px-4 py-4 text-right">↧</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr key={product.id} className="align-middle text-clay/78 transition hover:bg-blush/35">
                    <td className="border-b border-line px-4 py-4">
                      <input type="checkbox" aria-label={`Pilih ${product.name}`} className="h-4 w-4 rounded border-line accent-clay" />
                    </td>
                    <td className="border-b border-line px-3 py-4">
                      <p className="font-semibold">{skuFromProduct(product, index)}</p>
                      {product.colors > 1 && <p className="mt-1 text-[10px] font-bold text-clay/45">Variation ({product.colors})</p>}
                    </td>
                    <td className="border-b border-line px-3 py-4">
                      <div className="relative h-11 w-14 overflow-hidden rounded-lg bg-blush">
                        {product.image && <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />}
                      </div>
                    </td>
                    <td className="max-w-[210px] border-b border-line px-3 py-4">
                      <Link href={`/products/${product.id}/edit`} className="font-bold text-clay transition hover:text-clay/70">
                        {product.name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-clay/50">{product.leafSlug}</p>
                    </td>
                    <td className="border-b border-line px-3 py-4">{product.category}</td>
                    <td className="border-b border-line px-3 py-4">
                      <span className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-line bg-blush px-3 text-sm font-bold text-clay">
                        {product.stock}
                      </span>
                    </td>
                    <td className="border-b border-line px-3 py-4 text-clay/55">{warehouseLabel(index)}</td>
                    <td className="border-b border-line px-3 py-4 font-semibold">{product.price}</td>
                    <td className="border-b border-line px-3 py-4 text-xs leading-5 text-clay/55">{formatModified(product.updatedAt)}</td>
                    <td className="border-b border-line px-3 py-4">
                      <span className="rounded-full border border-line bg-blush px-3 py-1 text-[11px] font-bold text-clay">
                        {product.isPublished ? "ACCO" : "DRAFT"}
                      </span>
                      {product.isBestSeller && <p className="mt-1 text-[10px] font-bold text-clay/45">Best Seller</p>}
                    </td>
                    <td className="border-b border-line px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/${product.id}/edit`} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-clay transition hover:border-clay" aria-label={`Edit ${product.name}`}>
                          ✎
                        </Link>
                        <button type="button" onClick={() => remove(product)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-clay transition hover:border-red-300 hover:text-red-700" aria-label={`Hapus ${product.name}`}>
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function skuFromProduct(product: AdminProduct, index: number) {
  return product.slug.slice(0, 3).toUpperCase() + String(index + 400).padStart(3, "0");
}

function warehouseLabel(index: number) {
  const labels = ["Location A: 5", "Location C: 2", "Location D: 5", "multiple 22"];
  return labels[index % labels.length];
}

function formatModified(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
