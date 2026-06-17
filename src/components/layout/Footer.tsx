"use client";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footerBlurb, footerCols } from "@/lib/content";
import { site } from "@/lib/site";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const { tr } = useLang();
  return (
    <footer className="border-t border-border bg-surface-2">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="lg:pr-8">
          <Logo />
          <p className="mt-4 max-w-sm text-[0.86rem] text-text-2">{tr(footerBlurb)}</p>
        </div>
        {footerCols.map((col) => (
          <div key={tr(col.title)}>
            <span className="label text-text-2">{tr(col.title)}</span>
            <div className="mt-3 grid gap-2.5">
              {col.links.map((l) => (
                <a key={tr(l.label)} href={l.href} className="text-[0.86rem] text-text-2 transition-colors hover:text-text">{tr(l.label)}</a>
              ))}
            </div>
          </div>
        ))}
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5">
          <span className="mono text-[0.72rem] text-text-2">© 2026 RAI HOLDINGS · {site.docId}</span>
          <span className="mono flex gap-4 text-[0.72rem] text-text-2">
            <a href="#" className="hover:text-text">TERMS</a>
            <a href="#" className="hover:text-text">PRIVACY</a>
            <a href="#" className="hover:text-text">CONDUCT</a>
          </span>
        </Container>
      </div>
    </footer>
  );
}
