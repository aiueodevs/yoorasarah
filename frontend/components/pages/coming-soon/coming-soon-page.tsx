import { SparkleIcon } from "../../icons";
import { SiteLink } from "../../shared/site-link";

export function ComingSoonPage() {
  return (
    <section className="grid min-h-[calc(100svh-220px)] place-items-center rounded-[32px] border border-[#eaded5] bg-[#2b1c18] p-8 text-center text-white shadow-panel">
      <div className="max-w-2xl">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10"><SparkleIcon className="h-7 w-7" /></span>
        <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#f0c2b5]">Koleksi Eksklusif</p>
        <h1 className="mt-3 font-display text-6xl font-medium sm:text-8xl">Coming Soon</h1>
        <p className="mt-5 text-base leading-relaxed text-white/76">Koleksi One Set dari Yoora Sarah sedang dalam tahap kurasi dan persiapan. Nantikan paduan busana premium yang didesain khusus untuk melengkapi gaya elegan Anda.</p>
        <SiteLink href="/" className="mt-8 inline-flex rounded-full border border-white/25 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white">Kembali ke Beranda</SiteLink>
      </div>
    </section>
  );
}
