"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { personas, personasLead, personasTitle } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Personas() {
  const { tr } = useLang();
  return (
    <Section id="personas">
      <Container>
        <SectionHeading label={t("Who it's for", "Dành cho ai")} title={personasTitle} lead={personasLead} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-3">
          {personas.map((p, i) => (
            <Reveal key={tr(p.title)} delay={i * 70} className="flex flex-col bg-surface">
              <div className="aspect-[4/3] border-b border-border bg-bg" />
              <div className="p-6">
                <span className="mono text-[0.68rem] uppercase tracking-wide text-accent">{tr(p.tag)}</span>
                <h3 className="mt-2 text-[1.2rem] text-text">{tr(p.title)}</h3>
                <p className="mt-2 text-[0.9rem] text-text-2">{tr(p.body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
