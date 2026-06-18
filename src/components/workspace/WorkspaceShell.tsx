"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { hydrateStore, useOrgs, useCurrentOrg, switchOrg } from "@/lib/workspace-store";
import { AppLauncher } from "@/components/workspace/AppLauncher";

type NavItem = { href: string; label: T; icon: string };
type NavGroup = { label: T; items: NavItem[] };

const workspaceNav: NavGroup[] = [
  {
    label: t("Workspace", "Không gian"),
    items: [
      { href: "/workspace", label: t("Home", "Trang chủ"), icon: "home" },
      { href: "/workspace/ventures", label: t("Ventures", "Doanh nghiệp"), icon: "building" },
      { href: "/bigdata", label: t("Big Data", "Big Data"), icon: "database" },
      { href: "/llms", label: t("RAI LLMs", "RAI LLMs"), icon: "cpu" },
      { href: "/workspace/engines", label: t("Engines", "Engine"), icon: "settings" },
      { href: "/workspace/billing", label: t("Billing", "Thanh toán"), icon: "receipt" },
    ],
  },
  {
    label: t("RAI Solutions", "Giải pháp RAI"),
    items: [
      { href: "/marketplace", label: t("Marketplace", "Chợ ứng dụng"), icon: "cart" },
      { href: "/code", label: t("Code", "Mã nguồn"), icon: "cpu" },
      { href: "/apps", label: t("Apps", "Ứng dụng"), icon: "box" },
      { href: "/mcp", label: t("MCP", "MCP"), icon: "server" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/workspace" ? pathname === "/workspace" : pathname.startsWith(href);
}

const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

type PublicUser = { name: string; username: string; avatar: string };

export function WorkspaceShell({ children, user }: { children: React.ReactNode; user?: PublicUser }) {
  const { tr, lang, setLang } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const orgs = useOrgs();
  const currentOrg = useCurrentOrg();

  useEffect(() => {
    hydrateStore();
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const UserChip = user ? (
    <span className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-2 py-1">
      {user.avatar
        ? <img src={user.avatar} alt="" className="size-6 rounded-full object-cover" />
        : <span className="grid size-6 place-items-center rounded-full bg-accent/10 text-[0.6rem] font-medium text-accent">{(user.name || "U").slice(0, 1).toUpperCase()}</span>}
      <span className="hidden max-w-[120px] truncate text-[0.82rem] text-text sm:inline">{user.name}</span>
      <button onClick={signOut} aria-label={tr(t("Sign out", "Đăng xuất"))} className="text-text-2 hover:text-err"><Icon name="x" size={14} /></button>
    </span>
  ) : null;

  const OrgSwitcher = (
    <select
      value={currentOrg?.id ?? ""}
      onChange={(e) => switchOrg(e.target.value)}
      aria-label={tr(t("Organization", "Tổ chức"))}
      className="rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-1.5 text-[0.82rem] text-text"
    >
      {orgs.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );

  const CreditsChip = (
    <span className="mono flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-1.5 text-[0.78rem] text-text">
      <Icon name="coins" size={14} className="text-accent" />
      {fmtVnd(currentOrg?.balanceVnd ?? 0)}
    </span>
  );

  const LangToggle = (
    <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
      {(["en", "vi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2 py-1 uppercase transition-colors",
            lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );

  const NavLinks = (
    <nav className="flex flex-col gap-5">
      {workspaceNav.map((g) => (
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
        <Link href="/workspace" className="mb-6 flex items-center gap-2 px-1">
          <Logo />
        </Link>
        {NavLinks}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] text-text-2 transition-colors hover:text-text"
          >
            <Icon name="arrow-up-right" size={15} /> {tr(t("View site", "Xem trang"))}
          </a>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-h-dvh flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="grid size-9 place-items-center rounded-[var(--radius-md)] border border-border text-text lg:hidden"
            >
              <Icon name={open ? "x" : "menu"} size={18} />
            </button>
            <Link href="/workspace" className="lg:hidden">
              <Logo />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {OrgSwitcher}
            <span className="hidden sm:inline-flex">{CreditsChip}</span>
            <AppLauncher />
            {LangToggle}
            {UserChip}
          </div>
        </header>

        {/* credits chip on small screens */}
        <div className="flex justify-end border-b border-border px-4 py-2 sm:hidden">{CreditsChip}</div>

        {/* mobile drawer */}
        {open && (
          <div className="border-b border-border bg-bg p-4 lg:hidden">
            {NavLinks}
            <div className="mt-4">
              <a
                href="/"
                target="_blank"
                className="block rounded-[var(--radius-md)] border border-border px-3 py-2 text-center text-[0.84rem] text-text-2"
              >
                {tr(t("View site", "Xem trang"))}
              </a>
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
