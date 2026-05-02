"use client";

import { useState, type FormEvent } from "react";
import { cx, type ChatMessage } from "../../../lib/storefront";
import { SparkleIcon } from "../../icons";

export function StylistPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Selamat datang di layanan Stylist eksklusif Yoora Sarah. Bagaimana saya bisa menyempurnakan penampilan Anda hari ini? Ceritakan acara yang akan dihadiri atau nuansa yang ingin Anda tampilkan."
    }
  ]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((items) => [
      ...items,
      { role: "user", text: trimmed },
      { role: "assistant", text: "Saya rekomendasikan kombinasi warna netral dengan satu aksen lembut dari koleksi Dress atau Abaya." }
    ]);
    setInput("");
  };

  return (
    <>
      <section className="text-center">
        <p className="micro-label text-center">Bespoke Styling</p>
        <h1 className="display-title mt-3 text-6xl sm:text-8xl">AI Stylist</h1>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[390px_1fr]">
        <aside className="rounded-[28px] border border-[#eaded5] bg-[#2b1c18] p-6 text-white shadow-panel">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-white/10"><SparkleIcon className="h-6 w-6" /></span>
          <h2 className="mt-6 font-display text-4xl font-medium leading-tight">Sentuhan personal untuk setiap koleksi.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/72">Asisten virtual kami dilatih khusus untuk memahami proporsi, padu padan warna, dan etiket berbusana muslimah.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/72">Kami merangkai setiap potong koleksi Yoora Sarah menjadi kesatuan yang elegan khusus untuk Anda.</p>
          <p className="micro-label mt-6 text-[#f0c2b5]">Saran Interaksi</p>
          <div className="mt-6 grid gap-3">
            {["Mix & Match", "Cari by Acara", "Eksplorasi Warna", "Gaya Kasual"].map((label) => (
              <button key={label} type="button" onClick={() => setInput(label)} className="flex items-center justify-between rounded-full border border-white/18 px-4 py-3 text-sm font-bold text-white/88 transition hover:bg-white hover:text-ink">
                {label}<span aria-hidden="true">-&gt;</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="flex min-h-[520px] flex-col rounded-[28px] border border-[#eaded5] bg-white/82 p-5 shadow-soft">
          <div className="flex-1 space-y-3 overflow-auto pr-1">
            {messages.map((message, index) => (
              <p key={`${message.role}-${index}`} className={cx("max-w-[80%] rounded-[22px] px-5 py-4 text-sm leading-relaxed", message.role === "assistant" ? "bg-[#f3e7df] text-ink-soft" : "ml-auto bg-[#2b1c18] text-white")}>
                {message.text}
              </p>
            ))}
          </div>
          <form onSubmit={submit} className="mt-5 flex items-center gap-3 rounded-full border border-[#d9c4b8] bg-white px-4 py-2">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ceritakan preferensi gaya atau lampirkan foto barang Anda..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b1988e]" />
            <button type="submit" className="grid h-10 w-10 place-items-center rounded-full bg-[#2b1c18] text-sm font-bold text-white" aria-label="Kirim pesan">OK</button>
          </form>
        </div>
      </section>
    </>
  );
}
