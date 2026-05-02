"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../../lib/storefront";
import { MessageIcon, SparkleIcon } from "../icons";

const WHATSAPP_URL = "https://wa.me/6282315866088?text=Halo%20Yoora%20Sarah%2C%20saya%20ingin%20bantuan%20terkait%20pesanan%20saya.";

export function FloatingActions({ assistantOpen, onOpenAssistant }: { assistantOpen: boolean; onOpenAssistant: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openAssistant = () => {
    setMenuOpen(false);
    onOpenAssistant();
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-4 z-50 h-[154px] w-[154px] pointer-events-none sm:right-6">
      <button
        type="button"
        onClick={openAssistant}
        className={cx(
          "pointer-events-auto absolute bottom-[88px] right-1 grid h-11 w-11 place-items-center rounded-full border border-[#eaded5] bg-white text-[#51403a] shadow-[0_14px_30px_rgba(79,62,56,0.18)] transition duration-300 hover:-translate-y-0.5",
          menuOpen ? "translate-x-0 translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-x-1 translate-y-16 scale-75 opacity-0"
        )}
        aria-label="Chat dengan AI Assistant"
      >
        <SparkleIcon className="h-4 w-4" />
      </button>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => setMenuOpen(false)}
        className={cx(
          "pointer-events-auto absolute bottom-[44px] right-[76px] grid h-11 w-11 place-items-center rounded-full border border-[#d7bdaf] bg-[#fffaf5] text-[#51403a] shadow-[0_14px_30px_rgba(79,62,56,0.16)] transition duration-300 hover:-translate-y-0.5",
          menuOpen ? "translate-x-0 translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-x-16 translate-y-8 scale-75 opacity-0"
        )}
        aria-label="Chat langsung lewat WhatsApp"
      >
        <MessageIcon className="h-4 w-4" />
      </a>

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Tutup menu asisten belanja" : "Buka asisten belanja"}
        className={cx(
          "pointer-events-auto absolute bottom-0 right-0 grid h-14 w-14 place-items-center rounded-full text-[#fff8f3] shadow-[0_18px_40px_rgba(79,62,56,0.28)] transition hover:scale-[1.03]",
          menuOpen || assistantOpen ? "bg-[#a36f5e]" : "bg-[#4f3e38]"
        )}
      >
        <SparkleIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
