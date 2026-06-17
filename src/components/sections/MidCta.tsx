"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { midCta } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function MidCta() {
  const { tr } = useLang();
  return (
    <section id="cta-mid" className="border-y border-border bg-accent">
      <Container className="flex flex-col items-center gap-5 py-14 text-center md:flex-row md:justify-between md:text-left">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] text-white">{tr(midCta.title)}</h2>
          <p className="mt-2 text-[1rem] text-white/80">{tr(midCta.subtitle)}</p>
        </Reveal>
        <Reveal className="flex flex-none flex-wrap items-center justify-center gap-3">
          <a href="#cta-final" className="rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[0.92rem] font-medium text-accent transition-colors hover:bg-white/90">{tr(midCta.ctaPrimary)}</a>
          <a href="#events" className="rounded-[var(--radius-md)] border border-white/40 px-5 py-2.5 text-[0.92rem] font-medium text-white transition-colors hover:bg-white/10">{tr(midCta.ctaSecondary)}</a>
        </Reveal>
      </Container>
    </section>
  );
}
