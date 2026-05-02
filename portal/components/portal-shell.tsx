"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getAdminMe } from "../lib/api";
import { signOut, useSession } from "../lib/auth-client";

const primaryNav = [
  { label: "Dashboard", href: "/products", icon: "▣", activePaths: ["/products"] },
  { label: "Inventory", icon: "◇" },
  { label: "Marketplace", icon: "⌘" },
  { label: "Orders", icon: "◌" },
  { label: "Shipping", icon: "▱" },
  { label: "Reports", icon: "◎" }
];

const secondaryNav = [
  { label: "Settings", icon: "⚙" },
  { label: "Activity & Inventory", icon: "◇" },
  { label: "What’s New", icon: "✦" },
  { label: "Help & Support", icon: "☏" }
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PortalShellFallback />}>
      <PortalShellContent>{children}</PortalShellContent>
    </Suspense>
  );
}

function PortalShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useSession();
  const searchValue = searchParams.get("q") ?? "";
  const sessionUserId = session.data?.user?.id;
  const [adminStatus, setAdminStatus] = useState<"checking" | "allowed" | "forbidden">("checking");
  const [adminError, setAdminError] = useState<string | null>(null);

  const logout = async () => {
    await signOut();
    router.push("/login");
  };

  useEffect(() => {
    let active = true;
    if (session.isPending) return;

    if (!sessionUserId) {
      router.replace("/login");
      return;
    }

    setAdminStatus("checking");
    setAdminError(null);
    void getAdminMe()
      .then((admin) => {
        if (!active) return;
        setAdminStatus(admin.role === "admin" ? "allowed" : "forbidden");
        if (admin.role !== "admin") setAdminError("Akun ini tidak punya akses admin.");
      })
      .catch((error) => {
        if (!active) return;
        setAdminStatus("forbidden");
        setAdminError(error instanceof Error ? error.message : "Sesi admin tidak valid.");
      });

    return () => {
      active = false;
    };
  }, [router, session.isPending, sessionUserId]);

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(target);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f3] text-clay">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white/85 px-5 py-5 shadow-soft backdrop-blur xl:flex">
        <div className="flex items-center gap-3">
          <Link href="/products" className="grid h-9 w-9 place-items-center rounded-xl bg-clay text-lg font-black text-white">
            Y
          </Link>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-clay">Yoora</p>
            <p className="text-xs font-semibold text-clay/55">Admin Portal</p>
          </div>
          <span className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-line bg-blush text-clay/70">‹</span>
        </div>

        <nav className="mt-10 space-y-1" aria-label="Main portal navigation">
          {primaryNav.map((item) => (
            <ShellNavItem key={item.label} item={item} active={Boolean(item.activePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`)))} />
          ))}
        </nav>

        <nav className="mt-auto space-y-1" aria-label="Secondary portal navigation">
          {secondaryNav.map((item) => (
            <ShellNavItem key={item.label} item={item} active={false} />
          ))}
          <button type="button" onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-clay/45 transition hover:bg-blush hover:text-clay">
            <span className="grid h-6 w-6 place-items-center text-base">⇠</span>
            Log Out
          </button>
        </nav>
      </aside>

      <div className="min-h-screen xl:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-[72px] items-center gap-4 px-5 sm:px-7 lg:px-9">
            <Link href="/products" className="font-serif text-xl font-semibold text-clay xl:hidden">
              Yoora Sarah Portal
            </Link>
            <label className="hidden h-11 w-full max-w-[430px] items-center gap-3 rounded-xl border border-line bg-white px-4 text-sm text-clay/55 shadow-[0_8px_24px_rgba(85,65,58,0.04)] md:flex">
              <span>⌕</span>
              <input className="w-full border-0 bg-transparent outline-none placeholder:text-clay/45" placeholder="Search" value={searchValue} onChange={(event) => updateSearch(event.target.value)} />
            </label>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/products/new" className="button-secondary hidden sm:inline-flex">
                Add New
              </Link>
              <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-clay/70">
                ♡
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">0</span>
              </button>
              <div className="grid h-11 w-11 place-items-center rounded-full border border-line bg-blush text-sm font-black text-clay shadow-soft">YS</div>
            </div>
          </div>
        </header>

        <main className="w-full px-5 py-7 sm:px-7 lg:px-9">
          {(session.isPending || adminStatus === "checking") && (
            <p className="rounded-2xl border border-line bg-white p-5 text-sm text-clay/70 shadow-soft">Memeriksa sesi admin...</p>
          )}
          {!session.isPending && adminStatus === "forbidden" && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-soft">
              <p className="font-bold">Akses portal ditolak.</p>
              <p className="mt-1">{adminError ?? "Sesi admin tidak valid."}</p>
              <button type="button" onClick={logout} className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">
                Logout
              </button>
            </section>
          )}
          {!session.isPending && adminStatus === "allowed" ? children : null}
        </main>
      </div>
    </div>
  );
}

function PortalShellFallback() {
  return (
    <div className="min-h-screen bg-[#fbf7f3] px-5 py-7 text-clay">
      <p className="rounded-2xl border border-line bg-white p-5 text-sm text-clay/70 shadow-soft">Memuat portal...</p>
    </div>
  );
}

function ShellNavItem({
  item,
  active
}: {
  item: { label: string; href?: string; icon: string; activePaths?: string[] };
  active: boolean;
}) {
  const className = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
    active ? "bg-clay text-white shadow-soft" : "text-clay/65 hover:bg-blush hover:text-clay"
  }`;
  const content = (
    <>
      <span className="grid h-6 w-6 place-items-center text-base">{item.icon}</span>
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" disabled className={`${className} cursor-default opacity-75`}>
      {content}
    </button>
  );
}
