"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { aboutTabs } from "@/lib/about";

export function AboutNav() {
  const { lang, setLang, tr } = useLang();
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4"><Link href="/"><Logo /></Link><span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ COMPANY</span></div>
          <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
            {(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}
          </div>
        </div>
      </header>
      <nav className="sticky top-16 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] gap-0.5 overflow-x-auto px-5 sm:px-8">
          {aboutTabs.map((tb) => {
            const active = tb.route === "/about" ? pathname === "/about" : pathname === tb.route;
            return (
              <Link key={tb.key} href={tb.route} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors", active ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
                {tr(tb.label)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
