import { cx } from "../../lib/storefront";

export function NoticeToast({ message }: { message: string | null }) {
  return (
    <div className={cx("fixed left-1/2 top-[132px] z-[60] -translate-x-1/2 rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white shadow-panel transition", message ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0")}>
      {message}
    </div>
  );
}
