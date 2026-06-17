"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const subTabs = [
  { href: "/portfolio", label: t("Overview", "Tổng quan"), exact: true },
  { href: "/portfolio/platforms", label: t("Platform development", "Phát triển nền tảng") },
  { href: "/portfolio/companies", label: t("Member companies", "Công ty thành viên") },
  { href: "/portfolio/investments", label: t("Investments", "Đầu tư") },
];

export function PortfolioHeader() {
  const { lang, setLang, tr } = useLang();
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4"><Link href="/"><Logo /></Link><span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ PORTFOLIO</span></div>
          <nav className="flex items-center gap-0.5">
            <Link href="/admin/portfolio" className={cn("whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] transition-colors", pathname.startsWith("/admin/portfolio") ? "bg-surface text-text" : "text-text-2 hover:text-text")}>{tr(t("Admin", "Quản trị"))}</Link>
            <div className="mono ml-1 flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">{(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}</div>
          </nav>
        </div>
      </header>
      <nav className="sticky top-16 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] gap-0.5 overflow-x-auto px-5 sm:px-8">
          {subTabs.map((s) => {
            const active = s.exact ? pathname === s.href : pathname === s.href || pathname.startsWith(s.href + "/");
            return <Link key={s.href} href={s.href} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors", active ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>{tr(s.label)}</Link>;
          })}
        </div>
      </nav>
    </>
  );
}
