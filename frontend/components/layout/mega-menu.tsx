"use client";

import Image from "next/image";
import type { MouseEventHandler, PointerEventHandler } from "react";
import { cx, menuPanels, type MegaPanelName } from "../../lib/storefront";
import { SparkleIcon } from "../icons";
import { SiteLink } from "../shared/site-link";
import { MegaMenuIcon } from "./mega-menu-icons";

export function MegaMenu({
  activePanel,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onPointerEnter,
  onPointerLeave,
  topClassName = "top-[69px]"
}: {
  activePanel: MegaPanelName | null;
  onClose: () => void;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  onPointerEnter?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
  topClassName?: string;
}) {
  if (!activePanel) return null;

  const panel = menuPanels[activePanel];

  return (
    <div
      className={cx("pointer-events-none fixed inset-x-0 z-[55] hidden px-6 lg:block", topClassName)}
      aria-hidden={!activePanel}
    >
      <div
        className="pointer-events-auto relative mx-auto max-w-[1500px] rounded-[32px] border border-[#eaded5] bg-[#fffaf5] p-7 text-ink shadow-panel"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 2xl:grid-cols-[repeat(4,minmax(0,210px))_minmax(360px,1fr)]">
          {panel.groups.map((group) => (
            <div key={group.title} className="grid min-h-[360px] grid-rows-[auto_1fr] rounded-[28px] border border-[#eaded5] bg-[#fffaf7] p-6">
              <p className="micro-label">{group.title}</p>
              <div className="mt-6 grid content-start gap-3">
                {group.links.map((link) => (
                  <SiteLink key={link.href + link.title} href={link.href} onClick={onClose} className="group relative grid min-h-[64px] grid-cols-[36px_minmax(0,1fr)] items-start gap-3 rounded-[16px] p-1 transition hover:-translate-y-0.5 hover:bg-white/65">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-[#eaded5] bg-white text-[#9b725f] shadow-[0_10px_24px_rgba(64,48,48,0.06)] transition group-hover:border-[#d7aa99] group-hover:text-[#6f4638]">
                      <MegaMenuIcon name={link.icon} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block overflow-hidden pr-[76px] text-[15px] font-semibold leading-tight text-[#2f2320]">{link.title}</strong>
                      <small className="mt-1.5 block max-h-[38px] overflow-hidden text-[12px] leading-[1.45] text-ink-soft">{link.description}</small>
                    </span>
                    <span className="absolute right-1 top-[11px] inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#b48272] transition group-hover:text-[#6f4638]">
                      <span className="h-px w-1.5 bg-current opacity-55" />
                      Lihat
                    </span>
                  </SiteLink>
                ))}
              </div>
            </div>
          ))}

          <SiteLink href={panel.feature.href} onClick={onClose} className="group hidden min-h-[360px] overflow-hidden rounded-[28px] border border-[#eaded5] bg-[#fffaf7] text-ink 2xl:grid 2xl:grid-rows-[170px_1fr]">
            <div className="relative overflow-hidden bg-[#ded5cf]">
              <Image src={panel.feature.image} alt={panel.feature.label} fill sizes="500px" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/5 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full border border-white/75 bg-white/12 px-4 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                {panel.feature.label}
              </span>
              <span className="absolute inset-x-5 bottom-5 h-px bg-white/35" />
            </div>
            <div className="flex flex-col p-5">
              <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#a67664]">
                <SparkleIcon className="h-3.5 w-3.5 shrink-0" />
                {panel.feature.label}
              </span>
              <h2 className="mt-4 font-display text-[28px] font-medium leading-[1.04] text-[#241815]">{panel.feature.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{panel.feature.description}</p>
              <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#eaded5] pt-5">
                <span className="text-[12px] leading-relaxed text-[#80675d]">Kurasi produk, momen, dan styling.</span>
                <em className="inline-flex shrink-0 rounded-full border border-[#eaded5] bg-white px-4 py-2 text-[10px] font-extrabold uppercase not-italic tracking-[0.2em] text-ink transition group-hover:border-[#d7aa99]">
                  Lihat Koleksi
                </em>
              </div>
            </div>
          </SiteLink>
        </div>
      </div>
    </div>
  );
}
