"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { valueCards } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function ValueCards() {
  const { tr } = useLang();
  return (
    <Section id="how" alt>
      <Container>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {valueCards.map((c, i) => (
            <Reveal key={tr(c.title)} delay={i * 70} className="flex flex-col bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-[var(--radius-sm)] border" style={{ color: c.color, borderColor: c.color }}>
                <Icon name={c.icon} size={20} />
              </span>
              <span className="mono mt-5 text-[0.68rem] uppercase tracking-wide" style={{ color: c.color }}>{tr(c.tag)}</span>
              <h3 className="mt-1.5 text-[1.2rem] text-text">{tr(c.title)}</h3>
              <p className="mt-2 flex-1 text-[0.88rem] text-text-2">{tr(c.body)}</p>
              <a href="#cta-final" className="mt-4 inline-flex items-center gap-1 text-[0.84rem] font-medium" style={{ color: c.color }}>
                {tr(c.cta)} <Icon name="arrow-up-right" size={14} />
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
