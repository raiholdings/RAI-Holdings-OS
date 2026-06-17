"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const entities = [
  { href: "/", label: t("Holdings", "Holdings"), color: "var(--color-holdings)" },
  { href: "/fund", label: t("FUND", "FUND"), color: "var(--color-fund)" },
  { href: "/lab", label: t("LAB", "LAB"), color: "var(--color-lab)" },
  { href: "/one", label: t("ONE", "ONE"), color: "var(--color-one)" },
];
const solutions = [
  { href: "/apps", label: t("Apps", "Apps") },
  { href: "/mcp", label: t("MCP", "MCP") },
];

export function EcosystemHeader() {
  const { tr } = useLang();
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="RAI Holdings"><Logo /></Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {entities.map((e) => {
            const active = e.href === "/" ? false : pathname === e.href;
            return (
              <Link key={e.href} href={e.href} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] transition-colors", active ? "bg-surface text-text" : "text-text-2 hover:text-text")}>
                <span className="size-2 rounded-[1px]" style={{ background: e.color }} />
                {tr(e.label)}
              </Link>
            );
          })}
          <span className="mx-1 h-4 w-px bg-border" />
          {solutions.map((s) => {
            const active = pathname.startsWith(s.href);
            return (
              <Link key={s.href} href={s.href} className={cn("whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-2 text-[0.84rem] transition-colors", active ? "bg-surface text-text" : "text-text-2 hover:text-text")}>
                {tr(s.label)}
              </Link>
            );
          })}
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="mono ml-1 flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
      {(["en", "vi"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>
      ))}
    </div>
  );
}
