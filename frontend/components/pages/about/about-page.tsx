import Image from "next/image";

export function AboutPage() {
  return (
    <>
      <section className="rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur sm:p-10">
        <p className="micro-label">Tentang Yoora Sarah</p>
        <h1 className="display-title mt-3 max-w-4xl text-4xl leading-tight sm:text-6xl">Busana muslimah yang berbicara lewat kehalusan.</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-soft">Yoora Sarah hadir untuk perempuan yang menghargai detail. Setiap koleksi dirancang dengan perhatian penuh pada kenyamanan bahan, keindahan warna, dan siluet yang membuat Anda tampil percaya diri di setiap momen.</p>
      </section>
      <section className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-3">
        {["/assets/bella-dress.png", "/assets/yoora-dress.jpeg", "/assets/clara-dress.jpg"].map((image) => (
          <figure key={image} className="relative aspect-[3/4] overflow-hidden rounded-[24px] border border-[#eaded5] bg-[#efe2d9] shadow-soft">
            <Image src={image} alt="Koleksi Yoora Sarah" fill sizes="33vw" className="object-cover" />
          </figure>
        ))}
      </section>
      <section className="mt-8 rounded-[28px] border border-[#eaded5] bg-white/78 p-6 shadow-soft sm:p-8">
        <p className="micro-label">Yoora Sarah Studio</p>
        <h2 className="display-title mt-3 text-4xl">Komitmen Kami</h2>
        <p className="mt-4 max-w-4xl leading-relaxed text-ink-soft">Kami percaya bahwa keanggunan tidak harus mengorbankan kenyamanan. Dari pemilihan kain hingga potongan akhir, kami memastikan bahwa setiap jahitan tidak hanya terlihat indah, tetapi juga terasa nyaman dikenakan sepanjang hari.</p>
        <p className="mt-3 max-w-4xl leading-relaxed text-ink-soft">Yoora Sarah bukanlah tentang tren sesaat, melainkan tentang menciptakan koleksi esensial yang akan terus relevan dan menemani berbagai babak dalam hidup Anda.</p>
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {[
          ["Kualitas Terjaga", "Setiap produk dipilih dan dikurasi dengan standar yang tinggi untuk memastikan kenyamanan dan keanggunan."],
          ["Pengiriman Aman", "Diproses dari Jawa Barat dengan pembaruan status langsung ke WhatsApp Anda."],
          ["Layanan Personal", "Tim support yang siap membantu, dari pemilihan ukuran hingga styling advice."]
        ].map(([title, body]) => (
          <div key={title} className="rounded-[24px] border border-[#eaded5] bg-white/78 p-6 shadow-soft">
            <h3 className="display-title text-3xl">{title}</h3>
            <p className="mt-3 leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
