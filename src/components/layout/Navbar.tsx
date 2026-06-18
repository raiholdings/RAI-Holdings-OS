"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { navGroups } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { tr } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 bg-bg/90 backdrop-blur-md transition-colors", scrolled ? "border-b border-border" : "border-b border-transparent")}>
      <Container className="flex h-16 items-center justify-between gap-4">
        <a href="#top" aria-label="RAI Holdings"><Logo /></a>

        {/* desktop: mega groups */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navGroups.map((g) =>
            g.href ? (
              <a key={tr(g.label)} href={g.href} className="rounded-[var(--radius-md)] px-3 py-2 text-[0.9rem] text-text-2 transition-colors hover:text-text">
                {tr(g.label)}
              </a>
            ) : (
              <div key={tr(g.label)} className="group relative">
                <button className="flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-2 text-[0.9rem] text-text-2 transition-colors hover:text-text">
                  {tr(g.label)}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className="invisible absolute left-0 top-full w-56 translate-y-1 rounded-[var(--radius-lg)] border border-border bg-surface p-1.5 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {g.items.map((it) => (
                    <a key={tr(it.label)} href={it.href} className="block rounded-[var(--radius-md)] px-3 py-2 text-[0.86rem] text-text-2 transition-colors hover:bg-bg hover:text-text">
                      {tr(it.label)}
                    </a>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <a href="/login" className={cn(buttonClass("outline", "sm"), "hidden sm:inline-flex")}>{tr(t("Sign in", "Đăng nhập"))}</a>
          <a href="/login?tab=register" className={buttonClass("primary", "sm")}>{tr(t("Sign up", "Đăng ký"))}</a>
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open} className="grid size-9 place-items-center rounded-[var(--radius-md)] border border-border text-text lg:hidden">
            <Icon name={open ? "x" : "menu"} size={18} />
          </button>
        </div>
      </Container>

      {/* mobile drawer */}
      <div className={cn("overflow-y-auto border-border bg-surface transition-[max-height] duration-300 lg:hidden", open ? "max-h-[80vh] border-b" : "max-h-0")}>
        <Container className="flex flex-col py-3">
          {navGroups.map((g) =>
            g.href ? (
              <a key={tr(g.label)} href={g.href} onClick={() => setOpen(false)} className="label border-b border-border py-3 text-text last:border-0">{tr(g.label)}</a>
            ) : (
              <div key={tr(g.label)} className="border-b border-border py-3 last:border-0">
                <span className="label text-text-2">{tr(g.label)}</span>
                <div className="mt-2 grid gap-1">
                  {g.items.map((it) => (
                    <a key={tr(it.label)} href={it.href} onClick={() => setOpen(false)} className="text-[0.92rem] text-text">{tr(it.label)}</a>
                  ))}
                </div>
              </div>
            )
          )}
        </Container>
      </div>
    </header>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
      {(["en", "vi"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>
      ))}
    </div>
  );
}
