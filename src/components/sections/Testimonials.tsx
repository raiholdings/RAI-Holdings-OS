"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function Testimonials() {
  const { tr } = useLang();
  return (
    <Section id="testimonials">
      <Container>
        <SectionHeading
          label={t("Reviews", "Đánh giá")}
          title={t("Founders who built with us", "Những nhà sáng lập đã xây cùng chúng tôi")}
          center
        />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-3">
          {testimonials.map((tt, i) => (
            <Reveal key={tt.name} delay={i * 70} className="flex flex-col bg-surface p-7">
              <p className="flex-1 text-[1.02rem] leading-relaxed text-text">“{tr(tt.quote)}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid size-9 place-items-center rounded-full bg-bg text-[0.75rem] font-medium text-text-2">
                  {tt.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span>
                  <span className="block text-[0.88rem] font-medium text-text">{tt.name}</span>
                  <span className="mono block text-[0.7rem] text-text-2">{tr(tt.role)} · {tt.company}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
