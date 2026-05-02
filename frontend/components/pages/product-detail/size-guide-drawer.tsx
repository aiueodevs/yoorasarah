"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type Product } from "../../../lib/api";
import { cx } from "../../../lib/storefront";

type SizeGuideDrawerProps = {
  activeSize: string;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  open: boolean;
  product: Product;
  sizes: string[];
};

type ChartRow = {
  label: string;
  values: Record<string, string>;
};

const APPAREL_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const APPAREL_MEASUREMENTS: Record<string, { bodyLength: string; chest: string }> = {
  XS: { bodyLength: "122", chest: "96" },
  S: { bodyLength: "127", chest: "100" },
  M: { bodyLength: "132", chest: "100" },
  L: { bodyLength: "140", chest: "110" },
  XL: { bodyLength: "142", chest: "120" },
  XXL: { bodyLength: "146", chest: "126" },
  XXXL: { bodyLength: "150", chest: "132" }
};

export function SizeGuideDrawer({ activeSize, onClose, onSelectSize, open, product, sizes }: SizeGuideDrawerProps) {
  const chartSizes = useMemo(() => normalizeChartSizes(sizes), [sizes]);
  const chartRows = useMemo(() => buildChartRows(product, chartSizes), [product, chartSizes]);
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("55");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (open) setRecommendedSize(null);
  }, [open]);

  if (!open) return null;

  const checkSize = () => {
    setRecommendedSize(recommendSize(chartSizes, Number(height), Number(weight), activeSize));
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" aria-label="Tutup panduan ukuran" className="absolute inset-0 bg-[#1f1714]/38 backdrop-blur-[4px]" onClick={onClose} />
      <aside
        aria-labelledby="size-guide-title"
        aria-modal="true"
        className="absolute bottom-0 right-0 top-0 flex w-[min(476px,100vw)] flex-col bg-[#fffaf5] text-ink shadow-[0_28px_100px_rgba(30,20,15,0.24)]"
        role="dialog"
      >
        <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#eaded5] px-6">
          <h2 id="size-guide-title" className="font-display text-xl font-medium">Panduan Ukuran</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center text-2xl font-light leading-none text-[#9b725f] transition hover:text-ink" aria-label="Tutup panduan ukuran">
            X
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <Image src="/assets/logo.png" alt="" width={56} height={82} className="mx-auto h-11 w-11 object-contain opacity-10" />
          <div className="mt-5 text-center">
            <p className="font-display text-[30px] leading-none text-[#241815]">Size Chart</p>
            <p className="mt-3 font-display text-[18px] leading-none text-[#a87967]">{product.name}</p>
          </div>

          <div className="mt-9 overflow-hidden border border-[#eaded5]">
            <table className="w-full border-collapse bg-white text-sm text-[#5f504c]">
              <thead>
                <tr className="bg-[#f4ece6] text-[12px] font-bold text-[#2f221f]">
                  <th className="w-[36%] border-r border-[#eaded5] px-3 py-4 text-left font-semibold" scope="col" />
                  {chartSizes.map((size) => {
                    const isActive = normalizeSize(size) === normalizeSize(activeSize);
                    return (
                      <th key={size} className={cx("border-r border-[#eaded5] px-3 py-4 text-center font-bold last:border-r-0", isActive && "bg-[#2b1c18] text-white")} scope="col">
                        {size}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {chartRows.map((row) => (
                  <tr key={row.label} className="border-t border-[#eaded5]">
                    <th className="border-r border-[#eaded5] px-3 py-4 text-left text-[12px] font-bold text-[#6b5b56]" scope="row">{row.label}</th>
                    {chartSizes.map((size) => {
                      const isActive = normalizeSize(size) === normalizeSize(activeSize);
                      return (
                        <td key={`${row.label}-${size}`} className={cx("border-r border-[#eaded5] px-3 py-4 text-center last:border-r-0", isActive && "bg-[#f6f2ef] font-bold text-[#2b1c18]")}>
                          {row.values[size] ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mx-auto mt-5 max-w-[330px] text-center text-[11px] font-extrabold uppercase leading-relaxed tracking-[0.22em] text-[#b18473]">
            Seluruh detail ukuran pada produk ini menggunakan satuan centimeter (cm)
          </p>

          <div className="my-9 h-px bg-[#eaded5]" />

          <section>
            <p className="micro-label">Temukan Ukuranmu</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-[12px] text-[#9b725f]">
                Tinggi Badan (cm)
                <input
                  inputMode="numeric"
                  onChange={(event) => setHeight(event.target.value)}
                  value={height}
                  className="mt-3 h-12 w-full border-b border-[#d9c4b8] bg-transparent text-[16px] text-ink outline-none transition focus:border-[#2b1c18]"
                />
              </label>
              <label className="block text-[12px] text-[#9b725f]">
                Berat Badan (kg)
                <input
                  inputMode="numeric"
                  onChange={(event) => setWeight(event.target.value)}
                  value={weight}
                  className="mt-3 h-12 w-full border-b border-[#d9c4b8] bg-transparent text-[16px] text-ink outline-none transition focus:border-[#2b1c18]"
                />
              </label>
            </div>
            <button type="button" onClick={checkSize} className="mt-6 h-12 w-full bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822]">
              Cek Ukuran
            </button>
            {recommendedSize && (
              <div className="mt-4 border border-[#eaded5] bg-white px-4 py-4 text-sm leading-relaxed text-ink-soft">
                Rekomendasi ukuran untukmu: <strong className="font-bold text-ink">{recommendedSize}</strong>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSize(recommendedSize);
                    onClose();
                  }}
                  className="ml-2 border-b border-current text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b725f]"
                >
                  Pilih
                </button>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function normalizeChartSizes(sizes: string[]) {
  const cleanSizes = sizes.filter(Boolean);
  if (!cleanSizes.length) return ["All Size"];

  const byNormalized = new Map(cleanSizes.map((size) => [normalizeSize(size), size]));
  const isNumeric = cleanSizes.every((size) => /^\d+$/.test(size));

  if (isNumeric) {
    return [...cleanSizes].sort((first, second) => Number(first) - Number(second));
  }

  const ordered = APPAREL_ORDER.filter((size) => byNormalized.has(size)).map((size) => byNormalized.get(size) ?? size);
  return ordered.length ? ordered : cleanSizes;
}

function buildChartRows(product: Product, chartSizes: string[]): ChartRow[] {
  if (product.category === "Footwear") {
    return [
      {
        label: "Panjang Kaki",
        values: Object.fromEntries(chartSizes.map((size) => [size, `${Math.max(22, Number(size) - 13)}.${Number(size) % 2 === 0 ? "5" : "0"}`]))
      }
    ];
  }

  if (chartSizes.length === 1 && normalizeSize(chartSizes[0]) === "ALL SIZE") {
    return [
      { label: "Ukuran", values: { [chartSizes[0]]: "All Size" } },
      { label: "Fit", values: { [chartSizes[0]]: "Fleksibel" } }
    ];
  }

  return [
    {
      label: "Panjang Badan",
      values: Object.fromEntries(chartSizes.map((size) => [size, APPAREL_MEASUREMENTS[normalizeSize(size)]?.bodyLength ?? "-"]))
    },
    {
      label: "Lingkar Dada",
      values: Object.fromEntries(chartSizes.map((size) => [size, APPAREL_MEASUREMENTS[normalizeSize(size)]?.chest ?? "-"]))
    }
  ];
}

function recommendSize(chartSizes: string[], height: number, weight: number, fallback: string) {
  if (!height || !weight) return fallback;
  if (chartSizes.length === 1) return chartSizes[0];
  if (chartSizes.every((size) => /^\d+$/.test(size))) return nearestShoeSize(chartSizes, height);

  const candidates = new Set(chartSizes.map(normalizeSize));
  const orderedFallback = chartSizes[chartSizes.length - 1] ?? fallback;

  if (height >= 168 || weight >= 66) return pickAvailable(candidates, chartSizes, ["XL", "XXL", "XXXL"]) ?? orderedFallback;
  if (height >= 163 || weight >= 58) return pickAvailable(candidates, chartSizes, ["L", "XL"]) ?? orderedFallback;
  if (height >= 156 || weight >= 50) return pickAvailable(candidates, chartSizes, ["M", "L"]) ?? orderedFallback;
  return pickAvailable(candidates, chartSizes, ["S", "XS"]) ?? chartSizes[0] ?? fallback;
}

function nearestShoeSize(chartSizes: string[], height: number) {
  const index = Math.min(chartSizes.length - 1, Math.max(0, Math.round((height - 150) / 8)));
  return chartSizes[index];
}

function pickAvailable(candidates: Set<string>, chartSizes: string[], preferred: string[]) {
  const size = preferred.find((item) => candidates.has(item));
  return size ? chartSizes.find((item) => normalizeSize(item) === size) : undefined;
}

function normalizeSize(size: string) {
  return size.trim().toUpperCase();
}
