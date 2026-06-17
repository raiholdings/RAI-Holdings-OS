"use client";

import { Logo } from "@/components/ui/Logo";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const RAI = "https://raiholdings.vn";

export function VentureHeader() {
  const { lang, setLang, tr } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-4 px-5 sm:px-8">
        <a href={RAI} aria-label="RAI Holdings"><Logo /></a>
        <div className="flex items-center gap-3">
          <a href={RAI} className="hidden text-[0.84rem] text-text-2 transition-colors hover:text-text sm:block">
            {tr(t("RAI ecosystem", "Hệ sinh thái RAI"))}
          </a>
          <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
            {(["en", "vi"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
