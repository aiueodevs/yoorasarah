import type { Product } from "../../../lib/api";
import { ProductGrid } from "../../product/product-grid";

export function LatestPage({ products }: { products: Product[] }) {
  return (
    <>
      <section className="mx-auto mb-14 w-full max-w-[1280px] border-b border-[#a6846f]/[0.16] pb-10">
        <p className="micro-label">Koleksi Terbaru</p>
        <h1 className="display-title mt-3 max-w-4xl text-[52px] leading-tight sm:text-[64px]">Baru datang, siap dimiliki.</h1>
        <p className="mb-[26px] mt-[18px] max-w-2xl text-base leading-relaxed text-[#765d53]">
          Produk terbaru dengan tone studio yang lembut dan potongan yang sudah dikurasi. Pilihan segar untuk menyempurnakan koleksi Anda.
        </p>
      </section>
      <ProductGrid products={products} />
    </>
  );
}
