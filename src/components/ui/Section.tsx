import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Section({
  children,
  id,
  alt = false,
  className,
}: {
  children: ReactNode;
  id?: string;
  alt?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-t border-border py-20 sm:py-24",
        alt ? "bg-surface-2" : "bg-bg",
        className,
      )}
    >
      {children}
    </section>
  );
}
