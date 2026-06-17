"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { bootcamps, bootcampsLead, bootcampsTitle } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Bootcamps() {
  const { tr } = useLang();
  return (
    <Section id="bootcamps">
      <Container>
        <SectionHeading label={t("Bootcamps", "Bootcamps")} title={bootcampsTitle} lead={bootcampsLead} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-2">
          {bootcamps.map((b, i) => (
            <Reveal key={tr(b.title)} delay={i * 70} className="flex flex-col bg-surface p-7">
              <span className="grid size-10 place-items-center rounded-[var(--radius-sm)] border border-accent text-accent"><Icon name="bolt" size={20} /></span>
              <h3 className="mt-4 text-[1.2rem] text-text">{tr(b.title)}</h3>
              <p className="mt-2 flex-1 text-[0.9rem] text-text-2">{tr(b.body)}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="mono text-[0.74rem] text-text-2">{tr(b.start)}</span>
                <a href="#cta-final" className="inline-flex items-center gap-1 text-[0.84rem] font-medium text-accent">{tr(t("Learn more", "Tìm hiểu"))} <Icon name="arrow-up-right" size={14} /></a>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
