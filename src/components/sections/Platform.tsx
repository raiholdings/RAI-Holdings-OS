"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { platform } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function Platform() {
  const { tr } = useLang();
  return (
    <Section id="platform">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <span className="accent-rule mb-4 text-accent" />
          <span className="label text-text-2">{tr(platform.eyebrow)}</span>
          <h2 className="mt-2 text-[clamp(1.7rem,3.4vw,2.5rem)] text-text">{tr(platform.title)}</h2>
          <p className="mt-4 max-w-md text-[1.02rem] text-text-2">{tr(platform.body)}</p>
          <div className="mt-6 flex items-center gap-3">
            <a href="#cta-final" className={buttonClass("primary", "md")}>{tr(platform.cta)} <Icon name="arrow-up-right" size={16} /></a>
            <span className="mono text-[0.72rem] text-text-2">{tr(platform.note)}</span>
          </div>
        </Reveal>

        <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border">
          {platform.features.map((f) => (
            <div key={tr(f.label)} className="bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-[var(--radius-sm)] border border-accent text-accent">
                <Icon name={f.icon} size={20} />
              </span>
              <p className="mt-4 text-[0.95rem] font-medium text-text">{tr(f.label)}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
