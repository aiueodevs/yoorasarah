"use client";

import Image from "next/image";
import type { ProductColorVariant } from "../../../lib/api";
import { formatRupiah } from "../../../lib/api";
import type { CartItem } from "../../../lib/storefront";
import { colorHasStock, cx, detailImages, firstAvailableSizeForColor, productColorOptions, splitSizes, stockForSelection } from "../../../lib/storefront";
import { SiteLink } from "../../shared/site-link";
import { useStore } from "../../store/store-provider";
import { SummaryLine } from "./summary-line";

function selectedCartColor(item: CartItem, colorOptions: ProductColorVariant[]) {
  return colorOptions.find((option) => {
    if (item.colorVariantId && option.id === item.colorVariantId) return true;
    return option.name.toLowerCase() === item.color.toLowerCase();
  });
}

function cartItemImage(item: CartItem, color?: ProductColorVariant) {
  return detailImages(item.product, color)[0] ?? item.product.image;
}

export function CartPage() {
  const { cart, cartStatus, clearCart, removeCartItem, storeError, updateCartItem } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = cart.length ? 18000 : 0;
  const packing = cart.length ? 2000 : 0;
  const total = subtotal + shipping + packing;

  const changeQty = async (item: CartItem, delta: number) => {
    await updateCartItem(item.id, { quantity: Math.max(1, item.qty + delta) });
  };

  const changeSize = async (item: CartItem, size: string) => {
    if (item.size === size) return;
    await updateCartItem(item.id, { size });
  };

  const changeColor = async (item: CartItem, color: ProductColorVariant) => {
    if ((color.id && color.id === item.colorVariantId) || color.name === item.color) return;
    const sizeOptions = splitSizes(item.product);
    if (!colorHasStock(item.product, color, sizeOptions)) return;
    const nextSize = stockForSelection(item.product, color, item.size) > 0 ? item.size : firstAvailableSizeForColor(item.product, color, sizeOptions);
    await updateCartItem(item.id, {
      ...(color.id ? { colorVariantId: color.id } : {}),
      colorName: color.name,
      size: nextSize
    });
  };

  const removeItem = async (item: CartItem) => {
    await removeCartItem(item.id);
  };

  return (
    <>
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_360px]">
        <div>
          <p className="micro-label">Keranjang Belanja</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Ringkasan belanja yang rapi sebelum checkout.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">Cek kembali warna, ukuran, dan total pembayaran sebelum melanjutkan ke langkah akhir.</p>
        </div>
        <aside className="rounded-[24px] border border-[#eaded5] bg-white/72 p-5">
          <p className="micro-label">Nilai Pesanan</p>
          <h2 className="mt-3 font-display text-4xl font-medium">{formatRupiah(total)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Pengiriman diproses dari Jawa Barat dengan pembaruan status melalui WhatsApp.</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Informasi bahan, warna, dan ukuran ditulis ringkas agar lebih mudah dibandingkan.</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Panduan ukuran, kebijakan tukar, dan bantuan belanja tersedia untuk dibuka kapan saja.</p>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {cartStatus === "loading" && <div className="rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">Memuat keranjang...</div>}
          {cartStatus === "error" && <div className="rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">{storeError ?? "Keranjang belum bisa diambil dari backend."}</div>}
          {cartStatus !== "loading" && cartStatus !== "error" && cart.length === 0 && <div className="rounded-[24px] border border-[#eaded5] bg-white p-8 text-ink-soft">Keranjang masih kosong.</div>}
          {cart.map((item) => {
            const colorOptions = productColorOptions(item.product);
            const sizeOptions = splitSizes(item.product);
            const selectedColor = selectedCartColor(item, colorOptions);
            const selectedStock = stockForSelection(item.product, selectedColor, item.size);

            return (
              <article key={item.id} className="grid gap-4 rounded-[24px] border border-[#eaded5] bg-white/82 p-4 shadow-soft sm:grid-cols-[112px_1fr_auto]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[#efe2d9] sm:aspect-auto sm:h-36">
                  <Image src={cartItemImage(item, selectedColor)} alt={item.product.name} fill quality={65} sizes="112px" className="object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Pilihan Siap Beli</span>
                  <h3 className="mt-2 font-display text-3xl font-medium">{item.product.name}</h3>

                  <div className="mt-4 grid gap-3">
                    {colorOptions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9b725f]">Warna</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {colorOptions.map((color) => {
                            const selected = selectedColor?.name === color.name || selectedColor?.id === color.id;
                            const disabled = !colorHasStock(item.product, color, sizeOptions);
                            return (
                              <button
                                key={color.id ?? color.name}
                                type="button"
                                aria-pressed={selected}
                                disabled={disabled}
                                onClick={() => void changeColor(item, color)}
                                className={cx(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35",
                                  selected ? "border-[#7b5a4d] bg-[#f3e7df] text-[#5c4036]" : "border-[#eaded5] bg-white text-[#815b4b] hover:border-[#c99f8f]"
                                )}
                              >
                                <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                                {color.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {sizeOptions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9b725f]">Ukuran</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sizeOptions.map((size) => {
                            const selected = item.size === size;
                            const disabled = stockForSelection(item.product, selectedColor, size) <= 0;
                            return (
                              <button
                                key={size}
                                type="button"
                                aria-pressed={selected}
                                disabled={disabled}
                                onClick={() => void changeSize(item, size)}
                                className={cx(
                                  "min-w-10 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35",
                                  selected ? "border-[#7b5a4d] bg-[#f3e7df] text-[#5c4036]" : "border-[#eaded5] bg-white text-[#815b4b] hover:border-[#c99f8f]"
                                )}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <strong className="mt-4 block">{formatRupiah(item.lineTotal)}</strong>
                  <p className="mt-1 text-xs font-semibold text-[#9b725f]">Stock kombinasi: {selectedStock}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <button type="button" onClick={() => void removeItem(item)} className="rounded-full border border-[#d7bdaf] px-4 py-2 text-xs font-bold text-[#7f5f51]">Hapus</button>
                  <div className="inline-flex items-center rounded-full border border-[#d7bdaf] bg-white p-1">
                    <button type="button" onClick={() => void changeQty(item, -1)} disabled={item.qty <= 1} className="grid h-9 w-9 place-items-center rounded-full text-lg disabled:cursor-not-allowed disabled:opacity-35">-</button>
                    <span className="min-w-8 text-center text-sm font-bold">{item.qty}</span>
                    <button type="button" onClick={() => void changeQty(item, 1)} disabled={selectedStock <= 0 || item.qty >= selectedStock} className="grid h-9 w-9 place-items-center rounded-full text-lg disabled:cursor-not-allowed disabled:opacity-35">+</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-[24px] border border-[#eaded5] bg-white/82 p-5 shadow-soft">
          <p className="micro-label">Ringkasan</p>
          <SummaryLine label={`Subtotal ${cart.length} item`} value={formatRupiah(subtotal)} />
          <SummaryLine label="Pengiriman reguler" value={formatRupiah(shipping)} />
          <SummaryLine label="Layanan packing" value={formatRupiah(packing)} />
          <div className="mt-5 flex items-center justify-between border-t border-[#eaded5] pt-5">
            <span className="font-bold">Total</span>
            <strong className="font-display text-3xl font-medium">{formatRupiah(total)}</strong>
          </div>
          <SiteLink href="/checkout" className="mt-5 block w-full rounded-full bg-[#2b1c18] px-5 py-3 text-center text-sm font-bold text-white">Lanjut ke checkout</SiteLink>
          <button type="button" onClick={() => void clearCart()} className="mt-3 w-full rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Kosongkan keranjang</button>
          <div className="mt-5 rounded-[18px] bg-[#f3e7df] p-4">
            <p className="micro-label">Catatan belanja</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Di halaman checkout, Anda masih dapat meninjau ulang warna, ukuran, dan total pembayaran sebelum pesanan dikonfirmasi.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
