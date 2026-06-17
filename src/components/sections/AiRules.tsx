"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { aiRules } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function AiRules() {
  const { tr } = useLang();
  return (
    <Section id="ai">
      <Container>
        <SectionHeading label={t("The new rules", "Luật chơi mới")} title={aiRules.title} lead={aiRules.subtitle} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-3">
          {aiRules.cols.map((c, i) => (
            <Reveal key={tr(c.title)} delay={i * 80} className="bg-surface p-7">
              <span className="mono text-[0.68rem] uppercase tracking-wide text-accent">{tr(c.tag)}</span>
              <h3 className="mt-2 text-[1.25rem] text-text">{tr(c.title)}</h3>
              <p className="mt-2 text-[0.9rem] text-text-2">{tr(c.body)}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#cta-final" className={buttonClass("primary", "md")}>{tr(aiRules.cta)}</a>
        </div>
      </Container>
    </Section>
  );
}
