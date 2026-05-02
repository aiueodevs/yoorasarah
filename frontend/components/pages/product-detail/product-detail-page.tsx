"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type Product } from "../../../lib/api";
import { colorHasStock, cx, detailImages, firstAvailableColor, firstAvailableSizeForColor, productColorOptions, productSwatches, splitSizes, stockForSelection } from "../../../lib/storefront";
import { HeartIcon } from "../../icons";
import { useStore } from "../../store/store-provider";
import { SizeGuideDrawer } from "./size-guide-drawer";

export function ProductDetailPage({ product }: { product: Product }) {
  const { addCartItem, showNotice, toggleWishlistItem, wishlistProductIds } = useStore();
  const sizes = useMemo(() => splitSizes(product), [product]);
  const colorOptions = useMemo(() => productColorOptions(product), [product]);
  const swatches = useMemo(() => productSwatches(product), [product]);
  const initialColor = useMemo(() => firstAvailableColor(product, colorOptions, sizes), [colorOptions, product, sizes]);
  const initialSwatch = Math.max(0, colorOptions.findIndex((color) => color === initialColor));
  const description = product.description ?? [
    `${product.name} adalah koleksi Yoora Sarah yang dirancang untuk menghadirkan tampilan sopan, rapi, dan nyaman dipakai sepanjang hari.`,
    "Detail potongan, pilihan warna, dan materialnya dikurasi agar mudah dipadukan untuk aktivitas harian maupun momen spesial."
  ];
  const materials = product.materials ?? ["Material Premium"];
  const care = product.care ?? ["Cuci lembut"];
  const [activeSwatch, setActiveSwatch] = useState(initialSwatch);
  const activeColor = colorOptions[activeSwatch] ?? colorOptions[0];
  const images = useMemo(() => detailImages(product, activeColor), [activeColor, product]);
  const [activeImage, setActiveImage] = useState(images[0]);
  const [activeSize, setActiveSize] = useState(firstAvailableSizeForColor(product, activeColor, sizes));
  const [qty, setQty] = useState(1);
  const [savingCart, setSavingCart] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const saved = wishlistProductIds.includes(product.id);
  const activeStock = stockForSelection(product, activeColor, activeSize);

  useEffect(() => {
    const nextColor = firstAvailableColor(product, colorOptions, sizes);
    const nextIndex = Math.max(0, colorOptions.findIndex((color) => color === nextColor));
    setActiveImage(detailImages(product, nextColor)[0]);
    setActiveSwatch(nextIndex);
    setActiveSize(firstAvailableSizeForColor(product, nextColor, sizes));
    setQty(1);
    setSizeGuideOpen(false);
  }, [product.slug]);

  useEffect(() => {
    if (!images.includes(activeImage)) setActiveImage(images[0]);
  }, [activeImage, images]);

  useEffect(() => {
    if (activeStock > 0 && qty > activeStock) setQty(activeStock);
    if (activeStock <= 0 && qty !== 1) setQty(1);
  }, [activeStock, qty]);

  const addToCart = async () => {
    if (activeStock <= 0) {
      showNotice("Kombinasi warna dan ukuran ini sedang habis.");
      return;
    }
    setSavingCart(true);
    try {
      await addCartItem({
        productId: product.id,
        colorVariantId: activeColor?.id,
        colorName: activeColor?.name ?? "Warna",
        size: activeSize,
        quantity: Math.min(qty, activeStock)
      });
      showNotice(`${product.name} masuk keranjang.`);
    } finally {
      setSavingCart(false);
    }
  };

  const toggleWishlist = async () => {
    setSavingWishlist(true);
    try {
      const isSaved = await toggleWishlistItem(product.id);
      showNotice(isSaved ? `${product.name} masuk wishlist.` : `${product.name} dihapus dari wishlist.`);
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <>
      <section>
        <p className="micro-label">Beranda / {product.category} / {product.name}</p>
        <div className="mt-5 grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="grid gap-4 sm:grid-cols-[88px_1fr] lg:h-full">
            <div className="order-2 grid grid-cols-5 gap-3 sm:order-1 sm:grid-cols-1">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={cx(
                    "relative aspect-[3/4] overflow-hidden rounded-[16px] border bg-[#efe2d9] transition",
                    activeImage === image ? "border-[#2b1c18]" : "border-[#eaded5]"
                  )}
                >
                  <Image src={image} alt={`${product.name} look ${index + 1}`} fill quality={55} sizes="88px" className="object-cover" />
                </button>
              ))}
            </div>
            <figure className="relative order-1 aspect-[3/4] overflow-hidden rounded-[28px] border border-[#eaded5] bg-[#efe2d9] shadow-soft sm:order-2 lg:h-full lg:min-h-[720px] lg:aspect-auto">
              <Image src={activeImage} alt={product.name} fill priority quality={82} sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </figure>
          </div>

          <article className="h-full rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/86 p-6 shadow-soft backdrop-blur sm:p-8">
            <h1 className="display-title text-[42px] leading-none sm:text-[56px]">{product.name}</h1>
            <p className="mt-5 text-[16px] leading-none text-ink-soft">{product.price}</p>
            <hr className="my-7 border-[#decabd]" />

            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#332622]">
              <span>Warna</span>
              <span className="text-[12px] font-medium normal-case tracking-[0] text-[#9b725f]">
                {activeColor?.name ?? "Warna"}
              </span>
            </div>
            <div className="mt-4 flex max-w-[360px] flex-wrap gap-x-3 gap-y-3">
              {swatches.map((color, index) => (
                (() => {
                  const option = colorOptions[index];
                  const disabled = !colorHasStock(product, option, sizes);
                  return (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      aria-label={`Pilih warna ${option?.name ?? index + 1}`}
                      disabled={disabled}
                      onClick={() => {
                        if (!option || disabled) return;
                        setActiveSwatch(index);
                        setActiveImage(option.gallery[0] ?? product.image);
                        setActiveSize(stockForSelection(product, option, activeSize) > 0 ? activeSize : firstAvailableSizeForColor(product, option, sizes));
                        setQty(1);
                      }}
                      className={cx(
                        "h-8 w-8 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30",
                        activeSwatch === index ? "border-[#2b1c18] ring-2 ring-[#2b1c18] ring-offset-2 ring-offset-[#fffaf5]" : "border-[#e8d9d0]"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  );
                })()
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#332622]">
              <span>Ukuran</span>
              <button type="button" onClick={() => setSizeGuideOpen(true)} className="border-b border-current pb-0.5 text-[10px] tracking-[0.18em] text-[#9b725f]">
                Panduan
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 border-b border-[#decabd] pb-5">
              {sizes.map((size) => (
                (() => {
                  const disabled = stockForSelection(product, activeColor, size) <= 0;
                  return (
                <button
                  key={size}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setActiveSize(size);
                    setQty(1);
                  }}
                  className={cx(
                    "border-b pb-1 text-[13px] font-medium uppercase leading-none transition disabled:cursor-not-allowed disabled:opacity-35",
                    activeSize === size ? "border-[#2b1c18] text-[#2b1c18]" : "border-transparent text-[#9b725f] hover:border-[#d7bdaf] hover:text-ink"
                  )}
                >
                  {size}
                </button>
                  );
                })()
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[112px_1fr]">
              <div className="grid h-12 grid-cols-3 items-center border border-[#eaded5] bg-white">
                <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={activeStock <= 0} className="grid h-full place-items-center text-xl font-light text-[#9b725f] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Kurangi jumlah">
                  -
                </button>
                <span className="text-center text-sm font-semibold text-ink">{qty}</span>
                <button type="button" onClick={() => setQty((value) => Math.min(activeStock, value + 1))} disabled={activeStock <= 0 || qty >= activeStock} className="grid h-full place-items-center text-xl font-light text-[#9b725f] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Tambah jumlah">
                  +
                </button>
              </div>
              <button type="button" onClick={addToCart} disabled={savingCart || activeStock <= 0} className="h-12 bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-60">
                {savingCart ? "Menyimpan" : activeStock <= 0 ? "Stok Habis" : "Tambahkan"}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleWishlist}
              disabled={savingWishlist}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 border border-[#eaded5] bg-white px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-ink transition hover:border-[#d7bdaf]"
            >
              <HeartIcon className={cx("h-4 w-4", saved && "fill-current")} />
              {savingWishlist ? "Menyimpan" : saved ? "Wishlist Tersimpan" : "Wishlist"}
            </button>

            <hr className="my-6 border-[#eaded5]" />
            <p className="micro-label">Tentang Produk</p>
            {description.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-relaxed text-ink-soft">{paragraph}</p>
            ))}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoList title="Bahan & Detail" items={materials} />
              <InfoList title="Perawatan" items={care} />
            </div>
            <div className="mt-5 rounded-[20px] border border-[#eaded5] bg-white/76 p-4">
              <p className="micro-label">Stok Tersedia</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {activeStock} item tersedia untuk kombinasi {activeColor?.name ?? "warna"} ukuran {activeSize}. Butuh bantuan ukuran atau warna? Tim Yoora Sarah siap membantu melalui WhatsApp.
              </p>
            </div>
          </article>
        </div>
      </section>

      <SizeGuideDrawer
        activeSize={activeSize}
        onClose={() => setSizeGuideOpen(false)}
        onSelectSize={setActiveSize}
        open={sizeGuideOpen}
        product={product}
        sizes={sizes}
      />
    </>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[20px] border border-[#eaded5] bg-white/76 p-4">
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-ink-soft">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b08472]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
