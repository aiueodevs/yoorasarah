import { cx } from "../../lib/storefront";

export function Ticker({
  items,
  onClose,
  separator,
  variant
}: {
  items: string[];
  onClose?: () => void;
  separator: "plus" | "spark";
  variant: "top" | "bottom";
}) {
  const renderTrack = (copy: number) => (
    <div key={copy} className="flex min-w-max animate-ticker items-center gap-7 pr-7" aria-hidden="true">
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="inline-flex items-center gap-7 text-[11px] font-extrabold uppercase tracking-[0.22em]">
          {item}
          <b className="text-base leading-none">{separator === "plus" ? "+" : "*"}</b>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cx(
        "fixed inset-x-0 z-[60] flex h-8 overflow-hidden whitespace-nowrap",
        variant === "top"
          ? "top-0 border-b border-[#eaded5] bg-[#f4eee8] text-[#5a4138] shadow-[0_8px_24px_rgba(33,22,19,0.06)]"
          : "bottom-0 border-t border-[#eaded5] bg-[#f4eee8]/94 text-[#5a4138] shadow-[0_-18px_40px_rgba(33,22,19,0.08)]"
      )}
    >
      <div className={cx("flex min-w-0 flex-1 overflow-hidden", onClose && "pr-12")}>
        {renderTrack(0)}
        {renderTrack(1)}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-[#7e5848]/15 bg-[#fffaf5]/20 text-[14px] font-light leading-none text-[#6e5146]/75 backdrop-blur-sm transition hover:border-[#7e5848]/28 hover:bg-[#fffaf5]/42 hover:text-[#241815]"
          aria-label="Tutup running text"
        >
          x
        </button>
      )}
    </div>
  );
}
