"use client";

export function ApiErrorState({ message = "Data belum bisa diambil dari backend." }: { message?: string }) {
  return (
    <section className="mx-auto max-w-[760px] rounded-[28px] border border-[#eaded5] bg-white p-8 text-center shadow-soft">
      <p className="micro-label">Backend API</p>
      <h1 className="display-title mt-3 text-[42px] leading-tight">Data produk tidak tersedia.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 rounded-full bg-[#4f3e38] px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-[#6c5047]"
      >
        Coba Lagi
      </button>
    </section>
  );
}
