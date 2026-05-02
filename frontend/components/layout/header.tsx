"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BagIcon, ChevronDownIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "../icons";
import { useStore } from "../store/store-provider";
import { SiteLink } from "../shared/site-link";
import { cx, type MegaPanelName } from "../../lib/storefront";
import { MegaMenu } from "./mega-menu";
import { MobileDrawer } from "./mobile-drawer";

const PRODUCT_NAV_PATHS = [
  "/produk",
  "/best-seller",
  "/dress",
  "/abaya-2481",
  "/hijab-1544",
  "/khimar-5295",
  "/pashmina-2310",
  "/kids-9967",
  "/footwear-8675",
  "/accessories-4472",
  "/essentials-7002",
  "/one-set-5182"
];

export function Header({ currentPath, tickerVisible = false }: { currentPath: string; tickerVisible?: boolean }) {
  const [megaOpen, setMegaOpen] = useState<MegaPanelName | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cartCount } = useStore();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerTopClass = tickerVisible ? "top-8" : "top-0";
  const megaMenuTopClass = tickerVisible ? "top-[101px]" : "top-[69px]";
  const productActive = megaOpen === "produk" || PRODUCT_NAV_PATHS.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));

  const openMega = (panel: MegaPanelName) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(panel);
  };

  const scheduleMegaClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(null), 140);
  };

  return (
    <>
      <header className={cx("fixed inset-x-0 z-50 transition-[top] duration-200", headerTopClass)}>
        <div className="border-b border-[#eaded5] bg-white px-4 shadow-[0_8px_28px_rgba(33,22,19,0.06)] transition sm:px-6 lg:px-10">
          <div className="mx-auto flex h-[69px] max-w-[92rem] items-center justify-between gap-[26px]">
            <SiteLink href="/" className="relative z-10 block h-14 w-14 flex-none overflow-hidden rounded-full" aria-label="Yoora Sarah">
              <Image src="/assets/logo.png" alt="Yoora Sarah" width={240} height={356} priority className="h-full w-full object-contain" />
            </SiteLink>

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-[26px] text-ink lg:flex" aria-label="Main navigation">
              <SiteLink href="/terbaru" className="nav-link" data-active={currentPath === "/terbaru" ? "true" : undefined}>
                Terbaru
              </SiteLink>
              <div onPointerEnter={() => openMega("produk")} onPointerLeave={scheduleMegaClose} onMouseEnter={() => openMega("produk")} onMouseLeave={scheduleMegaClose}>
                <SiteLink
                  href="/produk"
                  className="nav-link"
                  data-active={productActive ? "true" : undefined}
                  aria-expanded={megaOpen === "produk"}
                  aria-haspopup="menu"
                  onClick={() => setMegaOpen(null)}
                  onFocus={() => openMega("produk")}
                >
                  Produk <ChevronDownIcon className={cx("mt-[0.06em] h-[1.08em] w-[1.08em] shrink-0 opacity-80 transition-transform", megaOpen === "produk" && "rotate-180")} />
                </SiteLink>
              </div>
              <SiteLink href="/tentang-kami" className="nav-link" data-active={currentPath === "/tentang-kami" ? "true" : undefined}>
                Tentang Kami
              </SiteLink>
              <SiteLink href="/stylist" className="nav-link" data-active={currentPath === "/stylist" ? "true" : undefined}>
                Stylist
              </SiteLink>
            </nav>

            <div className="hidden items-center gap-0.5 text-ink lg:flex" aria-label="Account actions">
              <IconLink href="/search" label="Search"><SearchIcon /></IconLink>
              <IconLink href="/wishlist" label="Wishlist"><HeartIcon /></IconLink>
              <IconLink href="/cart" label={`Cart, ${cartCount} item`}>
                <BagIcon />
                {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#c78a78] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
              </IconLink>
              <IconLink href="/profile" label="Profile"><UserIcon /></IconLink>
            </div>

            <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-[#d9c4b8] bg-white px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-ink lg:hidden" aria-label="Buka menu">
              Menu <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MegaMenu
        activePanel={megaOpen}
        onClose={() => setMegaOpen(null)}
        onPointerEnter={() => openMega("produk")}
        onPointerLeave={scheduleMegaClose}
        onMouseEnter={() => openMega("produk")}
        onMouseLeave={scheduleMegaClose}
        topClassName={megaMenuTopClass}
      />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <SiteLink href={href} aria-label={label} className="relative grid h-[54px] w-[54px] place-items-center rounded-full border border-transparent text-ink/80 transition hover:border-[#eaded5] hover:bg-[#f8f3ef] [&>svg]:h-[19px] [&>svg]:w-[19px]">
      {children}
    </SiteLink>
  );
}
