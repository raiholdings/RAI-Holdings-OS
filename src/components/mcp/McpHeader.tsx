"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function McpHeader() {
  const { tr } = useLang();
  const pathname = usePathname();
  const links = [
    { href: "/mcp", label: t("Registry", "Registry") },
    { href: "/mcp/publish", label: t("Publish", "Xuất bản") },
    { href: "/mcp/sync", label: t("Sync", "Đồng bộ") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/"><Logo /></Link>
          <span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ MCP REGISTRY</span>
        </div>
        <nav className="flex items-center gap-0.5">
          {links.map((l) => {
            const active = l.href === "/mcp" ? pathname === "/mcp" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={cn("rounded-[var(--radius-md)] px-3 py-2 text-[0.84rem] transition-colors", active ? "bg-surface text-text" : "text-text-2 hover:text-text")}>
                {tr(l.label)}
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
