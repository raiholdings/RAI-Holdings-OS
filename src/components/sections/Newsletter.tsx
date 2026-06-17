"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useLang, t } from "@/lib/i18n";

export function Newsletter() {
  const { tr } = useLang();
  const socials = ["LINKEDIN", "YOUTUBE", "INSTAGRAM", "X", "FACEBOOK"];
  return (
    <section id="newsletter" className="border-b border-border bg-surface">
      <Container className="flex flex-col items-center gap-5 py-14 text-center">
        <Reveal>
          <span className="accent-rule mx-auto mb-3 text-accent" />
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] text-text">{tr(t("Stay connected", "Kết nối với chúng tôi"))}</h2>
          <p className="mt-2 text-[0.98rem] text-text-2">{tr(t("Follow along for startup tactics, founder stories, and the occasional hot take.", "Theo dõi để nhận chiến thuật khởi nghiệp, câu chuyện nhà sáng lập và góc nhìn thẳng thắn."))}</p>
        </Reveal>
        <Reveal className="flex flex-wrap justify-center gap-2.5">
          {socials.map((s) => (
            <a key={s} href="#" className="mono rounded-[var(--radius-md)] border border-border px-3.5 py-2 text-[0.72rem] text-text-2 transition-colors hover:border-accent hover:text-accent">{s}</a>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
