"use client";

import { useState, type FormEvent } from "react";
import { cx, type ChatMessage } from "../../lib/storefront";
import { SparkleIcon } from "../icons";

export function AssistantPanel({ open, messages, onClose, onSend }: { open: boolean; messages: ChatMessage[]; onClose: () => void; onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <aside className={cx("fixed bottom-[106px] right-4 z-50 flex w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[28px] border border-[#eaded5] bg-[#fffaf5] shadow-panel transition sm:right-6", open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")} aria-hidden={!open}>
      <div className="flex items-center gap-3 border-b border-[#eaded5] p-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2b1c18] text-white"><SparkleIcon className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <strong className="block">Yoora Assistant</strong>
          <small className="text-ink-soft">Selalu siap membantumu</small>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7bdaf] bg-white text-sm font-bold" aria-label="Tutup asisten">X</button>
      </div>
      <div className="max-h-[330px] space-y-3 overflow-auto p-4">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={cx("rounded-[20px] px-4 py-3 text-sm leading-relaxed", message.role === "assistant" ? "bg-[#f3e7df] text-ink-soft" : "ml-auto max-w-[82%] bg-[#2b1c18] text-white")}>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-[#eaded5] p-3">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pesan Anda..." className="min-w-0 flex-1 rounded-full border border-[#d9c4b8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b1988e]" />
        <button type="submit" className="grid h-11 w-11 place-items-center rounded-full bg-[#2b1c18] text-xs font-bold text-white" aria-label="Kirim pesan">OK</button>
      </form>
    </aside>
  );
}
