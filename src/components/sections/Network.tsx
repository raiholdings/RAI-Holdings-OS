"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { network } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Network() {
  const { tr } = useLang();
  return (
    <Section id="network" alt>
      <Container>
        <SectionHeading label={t("Global network", "Mạng lưới toàn cầu")} title={network.title} lead={network.subtitle} center />

        <Reveal className="flex flex-wrap justify-center gap-1.5">
          {network.codes.map((c) => (
            <span key={c} className="mono rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-1.5 text-[0.74rem] text-text-2 transition-colors hover:border-accent hover:text-accent">
              {c}
            </span>
          ))}
        </Reveal>

        <Reveal className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-7 text-center sm:flex-row sm:text-left">
          <div>
            <span className="accent-rule mb-3 text-accent sm:mx-0" />
            <h3 className="text-[1.25rem] text-text">{tr(network.chapterTitle)}</h3>
            <p className="mt-1.5 text-[0.9rem] text-text-2">{tr(network.chapterBody)}</p>
          </div>
          <div className="flex flex-none gap-3">
            <a href="#cta-final" className={buttonClass("primary", "md")}>{tr(network.ctaPrimary)}</a>
            <a href="#" className={buttonClass("outline", "md")}>{tr(network.ctaSecondary)}</a>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
