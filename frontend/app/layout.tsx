import type { Metadata } from "next";
import { SiteShell } from "../components/layout/site-shell";
import { StoreProvider } from "../components/store/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beranda | Yoora Sarah",
  description: "Yoora Sarah storefront clone built with Next.js and Tailwind CSS"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <SiteShell>{children}</SiteShell>
        </StoreProvider>
      </body>
    </html>
  );
}
