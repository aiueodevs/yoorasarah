import { SiteLink } from "../../shared/site-link";

export const infoPages: Record<string, { title: string; body: string[] }> = {
  "cara-belanja": {
    title: "Cara Pemesanan",
    body: ["Pilih produk, warna, dan ukuran yang paling sesuai, lalu masukkan ke keranjang.", "Setelah checkout, tim Yoora Sarah akan membantu memastikan detail pesanan melalui WhatsApp."]
  },
  "metode-pembayaran": {
    title: "Cara Pembayaran",
    body: ["Pembayaran dapat dilakukan melalui virtual account atau instruksi pembayaran yang muncul di halaman checkout.", "Simpan bukti transfer agar proses verifikasi dapat berjalan lebih cepat."]
  },
  pengiriman: {
    title: "Pengiriman & Ongkos Kirim",
    body: ["Pesanan diproses dari Subang, Jawa Barat.", "Biaya pengiriman akan disesuaikan dengan alamat tujuan dan layanan kurir yang dipilih."]
  },
  "pengembalian-penukaran-produk": {
    title: "Pengembalian & Penukaran",
    body: ["Penukaran dapat dibantu selama produk masih memenuhi ketentuan kondisi, label, dan batas waktu yang berlaku.", "Hubungi tim support sebelum mengirimkan produk kembali."]
  },
  "panduan-ukuran": {
    title: "Panduan Ukuran",
    body: ["Cek keterangan ukuran di halaman produk sebelum checkout.", "Jika ragu, hubungi tim Yoora Sarah agar pilihan ukuran bisa disesuaikan dengan kebutuhan Anda."]
  },
  "tentang-yoora-sarah": {
    title: "Tentang Yoora Sarah",
    body: ["Yoora Sarah menghadirkan busana muslimah dengan detail lembut, potongan rapi, dan warna yang mudah dipadukan.", "Setiap koleksi dikurasi untuk menjaga kenyamanan, kesopanan, dan tampilan elegan."]
  },
  "hubungi-kami": {
    title: "Hubungi Kami",
    body: ["Tim Yoora Sarah siap membantu pertanyaan produk, pesanan, pembayaran, dan pengiriman.", "Gunakan tombol Chat Kami untuk terhubung melalui WhatsApp."]
  },
  karir: {
    title: "Karir",
    body: ["Yoora Sarah membuka kesempatan bagi talenta yang ingin tumbuh di dunia modest fashion.", "Informasi rekrutmen akan dibagikan melalui kanal resmi Yoora Sarah."]
  },
  "syarat-dan-ketentuan": {
    title: "Syarat & Ketentuan",
    body: ["Dengan menggunakan situs ini, pelanggan menyetujui proses belanja, pembayaran, pengiriman, dan layanan bantuan yang berlaku di Yoora Sarah.", "Ketentuan dapat diperbarui mengikuti kebutuhan operasional toko."]
  },
  "kebijakan-privasi": {
    title: "Kebijakan Privasi",
    body: ["Data pelanggan digunakan untuk memproses pesanan, pengiriman, pembayaran, dan komunikasi layanan.", "Yoora Sarah menjaga data pelanggan agar hanya digunakan sesuai kebutuhan transaksi."]
  },
  "kebijakan-cookie": {
    title: "Kebijakan Cookie",
    body: ["Cookie dapat digunakan untuk membantu pengalaman browsing, preferensi tampilan, dan peningkatan layanan.", "Anda dapat mengatur preferensi cookie melalui pengaturan browser."]
  }
};

export function InfoPage({ page }: { page: { title: string; body: string[] } }) {
  return (
    <section className="mx-auto max-w-4xl rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/82 p-6 shadow-soft backdrop-blur sm:p-10">
      <p className="micro-label">Informasi Yoora Sarah</p>
      <h1 className="display-title mt-3 text-4xl leading-tight sm:text-6xl">{page.title}</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
        {page.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <SiteLink href="/search" className="rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white">Cari koleksi</SiteLink>
        <SiteLink href="/" className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Kembali ke beranda</SiteLink>
      </div>
    </section>
  );
}
