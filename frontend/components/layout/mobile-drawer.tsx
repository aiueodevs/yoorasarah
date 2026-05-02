"use client";

import Image from "next/image";
import { cx, menuPanels } from "../../lib/storefront";
import { SiteLink } from "../shared/site-link";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drawerLinks = [
    {
      title: "Temukan",
      links: [
        { href: "/terbaru", title: "Terbaru", body: "Produk terbaru dengan tone lembut dan tampilan yang lebih rapi." },
        { href: "/#clearance", title: "Promo", body: "Lihat produk promo yang sedang aktif di halaman utama." },
        { href: "/one-set-5182", title: "One Set", body: "Pilih set lengkap untuk styling yang lebih cepat dan praktis." }
      ]
    },
      ...menuPanels.produk.groups.map((group) => ({
        title: group.title,
        links: group.links.map((link) => ({
          href: link.href,
          title: link.title,
          body: link.description
        }))
      }))
    ];

  return (
    <>
      <button type="button" aria-label="Tutup menu" onClick={onClose} className={cx("fixed inset-0 z-50 bg-black/35 transition lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cx("fixed bottom-0 right-0 top-0 z-50 flex w-[min(420px,100vw)] flex-col overflow-auto bg-[#fffaf5] p-5 shadow-panel transition lg:hidden", open ? "translate-x-0" : "translate-x-full")} aria-hidden={!open}>
        <div className="flex items-center justify-between gap-4">
          <SiteLink href="/" className="block w-[76px]" aria-label="Yoora Sarah">
            <Image src="/assets/logo.png" alt="Yoora Sarah" width={220} height={326} className="h-auto w-full" />
          </SiteLink>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-[#d7bdaf] bg-white text-sm font-bold" aria-label="Tutup menu">X</button>
        </div>
        <SiteLink href="/search" className="mt-6 rounded-full border border-[#d9c4b8] bg-white px-5 py-3 text-sm font-semibold text-ink-soft">
          Cari produk atau kategori
        </SiteLink>
        <div className="mt-6 grid gap-6">
          {drawerLinks.map((section) => (
            <div key={section.title}>
              <p className="micro-label">{section.title}</p>
              <div className="mt-3 grid gap-3">
                {section.links.map((link) => (
                  <SiteLink key={link.href + link.title} href={link.href} className="rounded-[18px] border border-[#eaded5] bg-white p-4">
                    <strong className="block font-display text-2xl font-medium">{link.title}</strong>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{link.body}</span>
                  </SiteLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        <nav className="mt-6 grid grid-cols-2 gap-2" aria-label="Mobile quick actions">
          {[
            ["Cari", "/search"],
            ["Wishlist", "/wishlist"],
            ["Stylist", "/stylist"],
            ["Keranjang", "/cart"],
            ["Akun", "/profile"]
          ].map(([label, href]) => (
            <SiteLink key={href} href={href} className="rounded-full border border-[#d7bdaf] bg-white px-4 py-3 text-center text-sm font-bold">
              {label}
            </SiteLink>
          ))}
        </nav>
        <div className="mt-6 rounded-[18px] bg-[#f3e7df] p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Bahasa Situs</p>
          <span className="mt-2 block text-sm text-ink-soft">Konten saat ini tersedia dalam Bahasa Indonesia.</span>
        </div>
      </aside>
    </>
  );
}
