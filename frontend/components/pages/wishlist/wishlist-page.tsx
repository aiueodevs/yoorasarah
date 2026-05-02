"use client";

import { useState } from "react";
import { HeartIcon } from "../../icons";
import { ProductGrid } from "../../product/product-grid";
import { SiteLink } from "../../shared/site-link";
import { useStore } from "../../store/store-provider";
import { QuickPanel } from "../search/quick-panel";

export function WishlistPage() {
  const { removeWishlistItem, showNotice, storeError, wishlistItems, wishlistStatus } = useStore();
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);
  const products = wishlistItems.map((item) => item.product);

  const removeItem = async (productId: string) => {
    setRemovingProductId(productId);
    try {
      await removeWishlistItem(productId);
      showNotice("Produk dihapus dari wishlist.");
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <>
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_360px]">
        <div>
          <p className="micro-label">Wishlist</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Simpan pilihan terbaik sebelum Anda memutuskan membeli.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">Gunakan halaman ini untuk membandingkan beberapa produk sekaligus sebelum memindahkannya ke keranjang.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SiteLink href="/cart" className="rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white">Buka keranjang</SiteLink>
            <SiteLink href="/search" className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Cari koleksi lain</SiteLink>
          </div>
        </div>
        <QuickPanel />
      </section>
      <section className="mt-8 flex items-center justify-between rounded-[24px] border border-[#eaded5] bg-white/72 p-5">
        <p className="text-sm font-semibold text-ink-soft">
          {wishlistStatus === "loading" ? "Memuat wishlist..." : `${products.length} produk tersimpan untuk dibandingkan`}
        </p>
        <span className="micro-label">Edit pilihan Anda</span>
      </section>
      {wishlistStatus === "error" && <p className="mt-8 rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">{storeError ?? "Wishlist belum bisa diambil dari backend."}</p>}
      {wishlistStatus !== "loading" && wishlistStatus !== "error" && products.length === 0 && <p className="mt-8 rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">Wishlist masih kosong. Buka detail produk lalu tekan tombol Wishlist untuk menyimpan pilihan.</p>}
      {products.length > 0 && (
        <ProductGrid
          products={products}
          renderAction={(product) => (
            <button
              type="button"
              disabled={removingProductId === product.id}
              onClick={() => void removeItem(product.id)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#d7bdaf] bg-white text-[#6e4f43] transition hover:border-[#b98572] hover:bg-[#fff7f2] hover:text-[#2b1c18] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Hapus ${product.name} dari wishlist`}
              title="Hapus dari wishlist"
            >
              <HeartIcon className="h-4 w-4 fill-current" />
            </button>
          )}
        />
      )}
    </>
  );
}
