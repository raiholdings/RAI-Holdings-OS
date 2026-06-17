"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { hero, heroStats } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function Hero() {
  const { tr } = useLang();
  return (
    <section id="stats" className="border-b border-border bg-bg">
      <Container className="py-16 text-center sm:py-24">
        <Reveal as="p" className="label mx-auto text-text-2">{tr(hero.eyebrow)}</Reveal>
        <Reveal as="h1" className="mx-auto mt-4 max-w-4xl text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.04] text-text">
          {tr(hero.title)}
        </Reveal>
        <Reveal as="p" className="mx-auto mt-5 max-w-2xl text-[1.1rem] text-text-2">{tr(hero.subtitle)}</Reveal>
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#cta-final" className={buttonClass("primary", "lg")}>{tr(hero.ctaPrimary)} <Icon name="arrow-up-right" size={18} /></a>
          <a href="#events" className={buttonClass("outline", "lg")}>{tr(hero.ctaSecondary)}</a>
        </Reveal>
      </Container>

      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-t-[var(--radius-lg)] border-x border-t border-border bg-border sm:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.value} className="bg-surface px-4 py-7 text-center">
              <div className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.6vw,1.9rem)] font-medium text-text">{s.value}</div>
              <div className="mono mt-1.5 text-[0.68rem] uppercase tracking-wide text-text-2">{tr(s.label)}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
