"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mentors, mentorsTitle } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Mentors() {
  const { tr } = useLang();
  return (
    <Section id="mentors">
      <Container>
        <SectionHeading label={t("Mentors", "Cố vấn")} title={mentorsTitle} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 40} className="flex items-center gap-4 bg-surface p-5">
              <span className="grid size-12 flex-none place-items-center rounded-full bg-bg font-[family-name:var(--font-display)] text-[0.9rem] font-medium text-text-2">
                {m.name.split(" ").map((w) => w[0]).slice(-2).join("")}
              </span>
              <span>
                <span className="block text-[0.92rem] font-medium text-text">{m.name}</span>
                <span className="mono block text-[0.72rem] text-text-2">{tr(m.role)}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
