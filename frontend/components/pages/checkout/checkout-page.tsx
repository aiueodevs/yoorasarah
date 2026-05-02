"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { formatRupiah } from "../../../lib/api";
import { SiteLink } from "../../shared/site-link";
import { useStore } from "../../store/store-provider";
import { SummaryLine } from "../cart/summary-line";

export function CheckoutPage() {
  const { cart, showNotice } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = cart.length ? 18000 : 0;
  const service = cart.length ? 2000 : 0;
  const total = subtotal + shipping + service;

  return (
    <>
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_380px]">
        <div>
          <p className="micro-label">Checkout</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Langkah akhir yang lebih jelas, cepat, dan tetap terasa premium.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">Tinjau alamat, pengiriman, dan metode pembayaran tanpa harus membaca form yang terlalu panjang.</p>
          <ol className="mt-6 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
            {[
              "Lengkapi nama penerima, alamat, dan nomor WhatsApp aktif.",
              "Pilih layanan pengiriman yang paling sesuai dengan kebutuhan Anda.",
              "Cek ulang ukuran, warna, dan total pembayaran sebelum konfirmasi."
            ].map((item, index) => (
              <li key={item} className="rounded-[18px] border border-[#eaded5] bg-white/78 p-4">
                <b className="mr-2 text-ink">{index + 1}.</b>{item}
              </li>
            ))}
          </ol>
        </div>
        <aside className="rounded-[24px] border border-[#eaded5] bg-white/72 p-5">
          <p className="micro-label">Total pembayaran</p>
          <h2 className="mt-3 font-display text-4xl font-medium">{formatRupiah(total)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Respon awal biasanya kurang dari 15 menit pada jam kerja.</p>
          <p className="mt-2 text-sm font-bold text-ink">Senin - Sabtu, 08.00 - 17.00 WIB</p>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <InfoCard title="Informasi penerima">
            <p className="font-display text-3xl font-medium">Sarah Rahmawati</p>
            <p className="mt-2 text-sm text-ink-soft">+62 823-1586-6088</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">Jl. Otto Iskandardinata No.271, Karanganyar, Subang, Jawa Barat 41211</p>
          </InfoCard>
          <InfoCard title="Pembayaran">
            <h2 className="font-display text-3xl font-medium">Virtual Account BCA</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">Setelah transfer selesai, kirim bukti pembayaran melalui WhatsApp agar pesanan dapat diproses lebih cepat.</p>
            <p className="mt-3 text-sm font-bold text-ink">Bayar maksimal 24 jam setelah checkout dikonfirmasi.</p>
          </InfoCard>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => showNotice("Konfirmasi akun demo siap dibuka.")} className="rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white">Konfirmasi via akun</button>
            <SiteLink href="/cart" className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Kembali ke keranjang</SiteLink>
          </div>
        </div>

        <aside className="h-fit rounded-[24px] border border-[#eaded5] bg-white/82 p-5 shadow-soft">
          <p className="micro-label">Pesanan</p>
          <div className="mt-4 grid gap-3">
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-[64px_1fr] gap-3 rounded-[18px] border border-[#eaded5] bg-[#fffaf5] p-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-[#efe2d9]">
                  <Image src={item.product.image} alt={item.product.name} fill quality={55} sizes="64px" className="object-cover" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-medium">{item.product.name}</h2>
                  <p className="mt-1 text-xs text-ink-soft">{item.color} / {item.size} / {item.qty} item</p>
                  <strong className="mt-2 block text-sm">{item.product.price}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[#eaded5] pt-1">
            <SummaryLine label="Subtotal" value={formatRupiah(subtotal)} />
            <SummaryLine label="Pengiriman" value={formatRupiah(shipping)} />
            <SummaryLine label="Layanan" value={formatRupiah(service)} />
            <div className="mt-5 flex items-center justify-between border-t border-[#eaded5] pt-5">
              <span className="font-bold">Total</span>
              <strong className="font-display text-3xl font-medium">{formatRupiah(total)}</strong>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#eaded5] bg-white/78 p-6 shadow-soft">
      <p className="micro-label">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
