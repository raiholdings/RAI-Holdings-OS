"use client";

import { Reveal } from "./Reveal";
import { useLang, type T } from "@/lib/i18n";

/** ALL CAPS label in the entity primary. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`label text-accent ${className ?? ""}`}>{children}</span>;
}

/**
 * Section heading with the brand "accent rule" — a 24×3px rectangle in the
 * entity primary directly above the H2. Sentence-case title.
 */
export function SectionHeading({
  label,
  title,
  lead,
  center = false,
}: {
  label: T;
  title: T;
  lead?: T;
  center?: boolean;
}) {
  const { tr } = useLang();
  return (
    <Reveal className={center ? "mx-auto mb-12 max-w-2xl text-center" : "mb-12 max-w-2xl"}>
      <span className={`accent-rule mb-4 text-accent ${center ? "mx-auto" : ""}`} />
      <span className="label text-text-2">{tr(label)}</span>
      <h2 className="mt-2 text-[clamp(1.6rem,3.2vw,2.25rem)] text-text">{tr(title)}</h2>
      {lead ? <p className="mt-3 text-[1.02rem] text-text-2">{tr(lead)}</p> : null}
    </Reveal>
  );
}
