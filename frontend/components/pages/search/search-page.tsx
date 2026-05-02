"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApiCategory, ProductSearchResult, ProductSearchSort } from "../../../lib/api";
import { cx, promptChips } from "../../../lib/storefront";
import { SearchIcon } from "../../icons";
import { ProductGrid } from "../../product/product-grid";
import { QuickPanel } from "./quick-panel";

export function SearchPage({ categories, result }: { categories: ApiCategory[]; result: ProductSearchResult }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(result.q);
  const [activeCategory, setActiveCategory] = useState(result.categorySlug);
  const [sort, setSort] = useState<ProductSearchSort>(result.sort);
  const categoryFilters = useMemo(() => [{ name: "Semua", slug: "" }, ...categories.map((category) => ({ name: category.name, slug: category.slug }))], [categories]);

  useEffect(() => setQuery(result.q), [result.q]);
  useEffect(() => setActiveCategory(result.categorySlug), [result.categorySlug]);
  useEffect(() => setSort(result.sort), [result.sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (activeCategory) params.set("categorySlug", activeCategory);
      if (sort !== "newest") params.set("sort", sort);

      startTransition(() => {
        router.replace(`/search${params.size ? `?${params}` : ""}`, { scroll: false });
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [activeCategory, query, router, sort, startTransition]);

  return (
    <>
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_360px]">
        <div>
          <p className="micro-label">Pencarian Koleksi</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Temukan produk yang paling sesuai dengan kebutuhan Anda.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">Cari berdasarkan nama produk, kategori, atau warna. Hasil akan langsung menyesuaikan agar Anda bisa membandingkan pilihan dengan cepat.</p>
          <form className="mt-6 flex items-center gap-3 rounded-full border border-[#d9c4b8] bg-white px-5 py-3" onSubmit={(event) => event.preventDefault()}>
            <SearchIcon className="h-5 w-5 text-[#9b725f]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari dress, khimar, warna moka, atau nama produk" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b1988e]" />
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {promptChips.map((label) => (
              <button key={label} type="button" onClick={() => setQuery(label)} className="rounded-full border border-[#decabd] bg-white px-4 py-2 text-xs font-bold text-[#7f5f51] transition hover:border-[#b98572]">
                {label}
              </button>
            ))}
          </div>
        </div>
        <QuickPanel />
      </section>

      <section className="mt-8 flex flex-col gap-5 rounded-[24px] border border-[#eaded5] bg-white/72 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-soft">{result.total} hasil siap Anda jelajahi</p>
          <h2 className="display-title text-3xl">Hasil pencarian</h2>
        </div>
        <div className="flex max-w-4xl flex-wrap items-center gap-2">
          {categoryFilters.map((category) => (
            <button key={category.slug || "all"} type="button" onClick={() => setActiveCategory(category.slug)} className={cx("rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] transition", activeCategory === category.slug ? "border-[#2b1c18] bg-[#2b1c18] text-white" : "border-[#decabd] bg-white text-[#7f5f51] hover:border-[#b98572]")}>
              {category.name}
            </button>
          ))}
          <select value={sort} onChange={(event) => setSort(event.target.value as ProductSearchSort)} className="rounded-full border border-[#decabd] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#7f5f51] outline-none">
            <option value="newest">Terbaru</option>
            <option value="best-seller">Best Seller</option>
            <option value="price-asc">Harga Rendah</option>
            <option value="price-desc">Harga Tinggi</option>
          </select>
        </div>
      </section>

      {result.products.length > 0 ? <ProductGrid products={result.products} /> : <p className="mt-8 rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">Belum ada produk yang cocok.</p>}
    </>
  );
}
