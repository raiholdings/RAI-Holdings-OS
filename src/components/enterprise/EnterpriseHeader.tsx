"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const links = [
  { href: "/enterprise", label: t("Overview", "Tổng quan"), exact: true },
];

export function EnterpriseHeader() {
  const { tr } = useLang();
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-4"><Link href="/"><Logo /></Link><span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ ENTERPRISE</span></div>
        <nav className="flex items-center gap-0.5">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return <Link key={l.href} href={l.href} className={cn("whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] transition-colors", active ? "bg-surface text-text" : "text-text-2 hover:text-text")}>{tr(l.label)}</Link>;
          })}
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return <div className="mono ml-1 flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">{(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}</div>;
}
