import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  narrow = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6",
        narrow ? "max-w-[820px]" : "max-w-[1180px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
