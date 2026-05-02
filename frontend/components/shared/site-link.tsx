"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export function SiteLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
