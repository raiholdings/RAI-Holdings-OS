"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { events, eventsLead, eventsTitle } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Events() {
  const { tr } = useLang();
  return (
    <Section id="events" alt>
      <Container>
        <SectionHeading label={t("Events", "Sự kiện")} title={eventsTitle} lead={eventsLead} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {events.map((e, i) => (
            <Reveal key={tr(e.title)} delay={i * 60} className="flex flex-col bg-surface p-6">
              <span className="mono text-[0.66rem] uppercase tracking-wide text-accent">{tr(t("Free event", "Miễn phí"))}</span>
              <h3 className="mt-3 flex-1 text-[1.02rem] leading-snug text-text">{tr(e.title)}</h3>
              <div className="mt-5 border-t border-border pt-3">
                <span className="mono block text-[0.74rem] text-text-2">{e.date}</span>
                <span className="mono block text-[0.74rem] text-text-2">{tr(e.mode)}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#" className={buttonClass("outline", "md")}>{tr(t("View all events", "Xem tất cả sự kiện"))}</a>
        </div>
      </Container>
    </Section>
  );
}
