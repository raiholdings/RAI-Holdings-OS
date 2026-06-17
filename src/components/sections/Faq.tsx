"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Faq() {
  const { tr } = useLang();
  return (
    <Section id="faq" alt>
      <Container narrow>
        <SectionHeading label={t("FAQ", "Hỏi đáp")} title={t("Frequently asked questions", "Câu hỏi thường gặp")} center />
        <div className="grid gap-2.5">
          {faqs.map((f, i) => (
            <Reveal key={tr(f.q)} delay={i * 50}>
              <details className="group rounded-[var(--radius-md)] border border-border bg-surface px-5 open:border-border-strong">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1rem] font-medium text-text [&::-webkit-details-marker]:hidden">
                  {tr(f.q)}
                  <span className="text-[1.4rem] font-normal text-accent transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-[0.92rem] text-text-2">{tr(f.a)}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
