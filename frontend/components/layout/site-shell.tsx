"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { stylistTicker } from "../../lib/storefront";
import { CustomerSessionBridge } from "../store/customer-session-bridge";
import { useStore } from "../store/store-provider";
import { AssistantPanel } from "./assistant-panel";
import { FloatingActions } from "./floating-actions";
import { Footer } from "./footer";
import { Header } from "./header";
import { NoticeToast } from "./notice-toast";
import { Ticker } from "./ticker";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [tickerOpen, setTickerOpen] = useState(true);
  const { assistantMessages, addAssistantMessage, notice } = useStore();
  const isHome = pathname === "/";
  const showTopTicker = isHome && tickerOpen;
  const homeTopPadding = showTopTicker ? "pt-[101px]" : "pt-[69px]";
  const homeShellStyle = {
    "--yoora-home-top-offset": showTopTicker ? "101px" : "69px"
  } as CSSProperties;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAssistantOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen page-bg text-ink">
      <CustomerSessionBridge />
      {showTopTicker && <Ticker items={stylistTicker} onClose={() => setTickerOpen(false)} variant="top" separator="spark" />}
      <Header currentPath={pathname} tickerVisible={showTopTicker} />
      <main>{isHome ? <div className={`bg-white ${homeTopPadding}`} style={homeShellStyle}>{children}</div> : <div className="min-h-screen px-4 pb-20 pt-[104px] sm:px-[5.5vw] lg:pt-[124px]">{children}</div>}</main>
      <Footer />
      <FloatingActions assistantOpen={assistantOpen} onOpenAssistant={() => setAssistantOpen(true)} />
      <AssistantPanel open={assistantOpen} messages={assistantMessages} onClose={() => setAssistantOpen(false)} onSend={addAssistantMessage} />
      <NoticeToast message={notice} />
    </div>
  );
}
