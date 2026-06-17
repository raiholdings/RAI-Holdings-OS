"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { finalCta } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function FinalCta() {
  const { tr } = useLang();
  return (
    <section id="cta-final" className="border-t border-border bg-surface">
      <Container className="py-20 text-center sm:py-24">
        <Reveal>
          <span className="accent-rule mx-auto mb-4 text-accent" />
          <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,4.2vw,3rem)] text-text">{tr(finalCta.title)}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.05rem] text-text-2">{tr(finalCta.subtitle)}</p>
        </Reveal>
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/app" className={buttonClass("primary", "lg")}>{tr(finalCta.ctaPrimary)} <Icon name="arrow-up-right" size={18} /></a>
          <a href="#events" className={buttonClass("outline", "lg")}>{tr(finalCta.ctaSecondary)}</a>
        </Reveal>
      </Container>
    </section>
  );
}
