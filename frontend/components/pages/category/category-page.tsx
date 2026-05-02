"use client";

import { useMemo, useState } from "react";
import { parsePrice, type CategoryRoute } from "../../../lib/api";
import { useStore } from "../../store/store-provider";
import { ProductGrid } from "../../product/product-grid";

export function CategoryPage({ route }: { route: CategoryRoute }) {
  const [sortMode, setSortMode] = useState<"latest" | "price">("latest");
  const { showNotice } = useStore();

  const visibleProducts = useMemo(() => {
    if (sortMode === "latest") return route.products;
    return [...route.products].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }, [route.products, sortMode]);

  const toggleSort = () => {
    setSortMode((mode) => (mode === "latest" ? "price" : "latest"));
    showNotice("Urutan koleksi diperbarui.");
  };

  return (
    <>
      <section className="mx-auto mb-14 flex w-full max-w-[1280px] flex-col gap-7 border-b border-[#a6846f]/[0.16] pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="display-title m-0 max-w-4xl text-[52px] leading-tight sm:text-[64px]">{route.title}</h1>
          <p className="mb-[26px] mt-[18px] max-w-2xl text-base leading-relaxed text-[#765d53]">{route.subtitle}</p>
          <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#a6846f]/[0.16] bg-white/70 px-4 text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#3d261f]">{route.countLabel}</span>
        </div>
        <button type="button" onClick={toggleSort} className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#a6846f]/[0.16] bg-white/70 px-4 text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#3d261f] transition hover:border-[#b98572]">
          Urutkan: {sortMode === "latest" ? "Koleksi Terbaru" : "Harga Terendah"}
        </button>
      </section>

      <ProductGrid products={visibleProducts} />
      <p className="mx-auto mt-10 max-w-[1280px] rounded-full border border-[#eaded5] bg-white/70 px-5 py-3 text-center text-sm font-semibold text-ink-soft">
        Semua {visibleProducts.length} produk sudah ditampilkan.
      </p>
    </>
  );
}
