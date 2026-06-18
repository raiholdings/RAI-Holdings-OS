"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: T; icon: string };
type NavGroup = { label: T; items: NavItem[] };

export const adminNav: NavGroup[] = [
  {
    label: t("Overview", "Tổng quan"),
    items: [{ href: "/admin", label: t("Dashboard", "Bảng điều khiển"), icon: "home" }],
  },
  {
    label: t("Ecosystem", "Hệ sinh thái"),
    items: [
      { href: "/admin/platform", label: t("Platform", "Nền tảng"), icon: "grid" },
      { href: "/admin/portfolio", label: t("Portfolio", "Danh mục"), icon: "stack" },
      { href: "/admin/marketplace", label: t("Marketplace", "Chợ ứng dụng"), icon: "cart" },
      { href: "/admin/mcp", label: t("MCP servers", "Máy chủ MCP"), icon: "server" },
      { href: "/admin/apps", label: t("Apps", "Ứng dụng"), icon: "box" },
      { href: "/admin/code", label: t("Code", "Mã nguồn"), icon: "cpu" },
      { href: "/admin/llms", label: t("LLM gateway", "Cổng LLM"), icon: "server" },
    ],
  },
  {
    label: t("Pages", "Trang nội dung"),
    items: [
      { href: "/admin/pricing", label: t("Pricing", "Bảng giá"), icon: "receipt" },
      { href: "/admin/enterprise", label: t("Enterprise", "Doanh nghiệp"), icon: "building" },
      { href: "/admin/about", label: t("About & site", "Giới thiệu & site"), icon: "world" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { tr, lang, setLang } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  const NavLinks = (
    <nav className="flex flex-col gap-5">
      {adminNav.map((g) => (
        <div key={tr(g.label)}>
          <div className="label mb-1.5 px-2 text-text-2">{tr(g.label)}</div>
          <div className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[0.88rem] transition-colors",
                    active ? "bg-accent/10 font-medium text-accent" : "text-text-2 hover:bg-surface hover:text-text"
                  )}
                >
                  <Icon name={it.icon} size={15} />
                  {tr(it.label)}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[248px_1fr]">
      {/* sidebar — desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-bg p-4 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-1">
          <Logo />
        </Link>
        {NavLinks}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <a href="/" target="_blank" className="flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] text-text-2 transition-colors hover:text-text">
            <Icon name="arrow-up-right" size={15} /> {tr(t("View site", "Xem trang"))}
          </a>
          <button onClick={logout} className="flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[0.84rem] text-text-2 transition-colors hover:text-err">
            <Icon name="x" size={15} /> {tr(t("Sign out", "Đăng xuất"))}
          </button>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-h-dvh flex-col">
        {/* top bar — mobile */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="grid size-9 place-items-center rounded-[var(--radius-md)] border border-border text-text">
            <Icon name={open ? "x" : "menu"} size={18} />
          </button>
          <Logo />
          <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
            {(["en", "vi"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase", lang === l ? "bg-accent text-white" : "text-text-2")}>{l}</button>
            ))}
          </div>
        </header>

        {/* mobile drawer */}
        {open && (
          <div className="border-b border-border bg-bg p-4 lg:hidden">
            {NavLinks}
            <div className="mt-4 flex gap-2">
              <a href="/" target="_blank" className="flex-1 rounded-[var(--radius-md)] border border-border px-3 py-2 text-center text-[0.84rem] text-text-2">{tr(t("View site", "Xem trang"))}</a>
              <button onClick={logout} className="flex-1 rounded-[var(--radius-md)] border border-border px-3 py-2 text-[0.84rem] text-err">{tr(t("Sign out", "Đăng xuất"))}</button>
            </div>
          </div>
        )}

        {/* desktop lang toggle floats top-right of content */}
        <div className="hidden justify-end px-8 pt-4 lg:flex">
          <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
            {(["en", "vi"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>
            ))}
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
