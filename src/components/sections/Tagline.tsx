"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { tagline } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export function Tagline() {
  const { tr } = useLang();
  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-14">
        <Reveal as="p" className="mx-auto max-w-3xl text-center text-[clamp(1.2rem,2.4vw,1.6rem)] leading-snug text-text">
          {tr(tagline)}
        </Reveal>
      </Container>
    </section>
  );
}
