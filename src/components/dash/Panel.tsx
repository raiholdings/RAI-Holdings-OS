import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Panel({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-[family-name:var(--font-display)] text-[1.02rem] font-medium text-text">{title}</h2>}
            {subtitle && <p className="mono mt-0.5 text-[0.72rem] text-text-2">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
