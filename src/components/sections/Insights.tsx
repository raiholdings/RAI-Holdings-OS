"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { insights, insightsLead, insightsTitle } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Insights() {
  const { tr } = useLang();
  return (
    <Section id="insights" alt>
      <Container>
        <SectionHeading label={t("Insights", "Bài viết")} title={insightsTitle} lead={insightsLead} center />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-3">
          {insights.map((a, i) => (
            <Reveal key={tr(a.title)} delay={i * 70} className="flex flex-col bg-surface">
              <div className="aspect-[16/9] border-b border-border bg-bg" />
              <div className="flex flex-1 flex-col p-6">
                <span className="mono text-[0.7rem] text-text-2">{a.date}</span>
                <h3 className="mt-2 flex-1 text-[1.05rem] leading-snug text-text">{tr(a.title)}</h3>
                <a href="#" className="mt-4 inline-flex items-center gap-1 text-[0.84rem] font-medium text-accent">{tr(t("Read", "Đọc"))} →</a>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#" className={buttonClass("outline", "md")}>{tr(t("View all posts", "Xem tất cả bài"))}</a>
        </div>
      </Container>
    </Section>
  );
}
