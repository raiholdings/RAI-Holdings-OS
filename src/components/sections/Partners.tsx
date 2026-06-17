"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { partners, partnersTitle } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function Partners() {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-bg">
      <Container className="py-14">
        <Reveal as="p" className="label text-center text-text-2">{tr(partnersTitle)}</Reveal>
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {partners.map((p) => (
            <span key={p} className="font-[family-name:var(--font-display)] text-[1.05rem] text-text-2/80">{p}</span>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
