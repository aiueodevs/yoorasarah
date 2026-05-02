import { SiteLink } from "../../shared/site-link";

export function QuickPanel() {
  const links = [
    { href: "/profile", label: "Akun", title: "Buka profil", body: "Lihat pesanan, alamat, dan koleksi favorit dalam satu halaman yang rapi." },
    { href: "/wishlist", label: "Wishlist", title: "Simpan favorit", body: "Kumpulkan produk yang ingin dibandingkan sebelum lanjut belanja." },
    { href: "/checkout", label: "Checkout", title: "Lanjut checkout", body: "Lihat ringkasan belanja dan teruskan ke pengiriman serta pembayaran." }
  ];

  return (
    <aside className="rounded-[24px] border border-[#eaded5] bg-white/72 p-5">
      <p className="micro-label">Akses Cepat</p>
      <div className="mt-4 grid gap-3">
        {links.map((item) => (
          <SiteLink key={item.href} href={item.href} className="block rounded-[18px] border border-[#eaded5] bg-[#fffaf5] p-4 transition hover:border-[#c99a88] hover:bg-white">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">{item.label}</span>
            <h2 className="mt-2 font-display text-2xl font-medium">{item.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </SiteLink>
        ))}
      </div>
    </aside>
  );
}
