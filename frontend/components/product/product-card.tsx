import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import type { Product } from "../../lib/api";
import { SiteLink } from "../shared/site-link";

type ProductCardProps = {
  action?: ReactNode;
  priority?: boolean;
  product: Product;
};

export function ProductCard({ action, priority = false, product }: ProductCardProps) {
  const handleActionClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <SiteLink href={product.slug} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#a6846f]/[0.12] bg-white/75 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(59,36,27,0.11)]">
      <figure className="relative m-0 h-[375px] shrink-0 overflow-hidden bg-white">
        {product.badge && <span className="absolute left-4 top-4 z-10 rounded-full border border-[#a6846f]/[0.16] bg-[#fffcf8]/90 px-[18px] py-[10px] text-[9px] font-extrabold uppercase tracking-[0.34em] text-[#9d7564]">{product.badge}</span>}
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          quality={72}
          sizes="(min-width: 1280px) 288px, (min-width: 1024px) 24vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </figure>
      <div className="flex flex-1 flex-col px-6 py-[26px]">
        <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#9b725f]">
          <span>{product.name}</span>
          <span>{product.category}</span>
        </div>
        <h3 className="mb-[14px] mt-[18px] min-h-[70px] font-display text-[29px] font-medium leading-tight text-ink">{product.name}</h3>
        <strong className="block text-lg text-[#111]">{product.price}</strong>
        <div className="mt-auto flex min-h-[66px] justify-between gap-3 border-t border-[#a6846f]/[0.12] pt-[18px] text-[13px] text-[#765d53]">
          <span>{product.colors} pilihan warna</span>
          <span className="max-w-[48%] text-right">{product.sizes}</span>
        </div>
        {action ? (
          <div className="mt-5 flex min-h-10 items-center justify-between gap-2 text-sm leading-6 text-[#6f5b52]">
            <span className="min-w-0">Lihat detail produk.</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-[#d7bdaf] bg-white px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#241915]">
                Detail Produk
              </span>
              <div onClick={handleActionClick}>
                {action}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative mt-5 min-h-8 overflow-hidden text-sm leading-7 text-[#6f5b52]">
            <p className="transition-transform duration-300 group-hover:-translate-y-12">Lihat detail ukuran, warna, dan stok terbaru.</p>
            <span className="absolute bottom-0 right-0 translate-y-8 rounded-full border border-[#d7bdaf] bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#241915] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              Detail Produk
            </span>
          </div>
        )}
      </div>
    </SiteLink>
  );
}
