"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { successLogos, successTitle, successLead } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export function SuccessStories() {
  const { tr } = useLang();
  return (
    <Section id="success" alt>
      <Container>
        <SectionHeading label={t("Portfolio", "Danh mục")} title={successTitle} lead={successLead} center />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-4">
          {successLogos.map((l) => (
            <Reveal key={l} className="flex items-center justify-center bg-surface px-4 py-9">
              <span className="font-[family-name:var(--font-display)] text-[1.1rem] text-text-2">{l}</span>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#" className={buttonClass("outline", "md")}>{tr(t("View more alumni", "Xem thêm cựu thành viên"))}</a>
        </div>
      </Container>
    </Section>
  );
}
