import Image from "next/image";
import { MessageIcon } from "../icons";
import { SiteLink } from "../shared/site-link";

const footerColumns = [
  {
    title: "Bantuan Belanja",
    links: [
      ["Cara Pemesanan", "/pages/cara-belanja"],
      ["Cara Pembayaran", "/pages/metode-pembayaran"],
      ["Pengiriman & Ongkos Kirim", "/pages/pengiriman"],
      ["Pengembalian & Penukaran", "/pages/pengembalian-penukaran-produk"],
      ["Panduan Ukuran", "/pages/panduan-ukuran"]
    ]
  },
  {
    title: "Tentang Kami",
    links: [
      ["Tentang Yoora Sarah", "/pages/tentang-yoora-sarah"],
      ["Hubungi Kami", "/pages/hubungi-kami"],
      ["Karir", "/pages/karir"]
    ]
  },
  {
    title: "Kebijakan",
    links: [
      ["Syarat & Ketentuan", "/pages/syarat-dan-ketentuan"],
      ["Kebijakan Privasi", "/pages/kebijakan-privasi"],
      ["Kebijakan Cookie", "/pages/kebijakan-cookie"]
    ]
  }
];

const socialLinks = [
  ["Instagram", "https://www.instagram.com/yoora.sarah"],
  ["TikTok", "https://www.tiktok.com/@yoora_sarah"],
  ["Shopee", "https://shopee.co.id/yoora.sarah"]
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-[#eaded5] bg-[#f6eee7] px-4 py-12 text-ink sm:px-[5.5vw]">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1.15fr_1.85fr]">
        <div>
          <SiteLink href="/" className="inline-flex items-center gap-4" aria-label="Yoora Sarah">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-white">
              <Image src="/assets/logo.png" alt="Yoora Sarah" fill sizes="64px" className="object-contain" />
            </span>
          </SiteLink>
          <h2 className="mt-6 max-w-[calc(100vw-32px)] break-words font-display text-2xl font-medium sm:text-3xl">PT Yoora Sarah Sentosa</h2>
          <p className="mt-4 max-w-[300px] break-words text-sm leading-7 text-ink-soft sm:max-w-md">
            Jl. Otto Iskandardinata No.271, Karanganyar, Kec. Subang, Kabupaten Subang, Jawa Barat 41211 KAB. SUBANG - SUBANG JAWA BARAT ID 41211
          </p>
          <a href="tel:+6282315866088" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d7bdaf] bg-white px-4 py-2 text-sm font-bold">
            <MessageIcon className="h-4 w-4" /> +6282315866088
          </a>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="micro-label">{column.title}</p>
              <div className="mt-4 grid gap-3">
                {column.links.map(([label, href]) => (
                  <SiteLink key={href} href={href} className="text-sm font-semibold text-ink-soft transition hover:text-ink">
                    {label}
                  </SiteLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1280px] flex-col gap-4 border-t border-[#decabd] pt-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Yoora Sarah. Semua hak dilindungi.</span>
        <div className="flex flex-wrap gap-4">
          {socialLinks.map(([label, href]) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" className="font-bold transition hover:text-ink">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
