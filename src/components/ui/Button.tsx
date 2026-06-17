import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

// Confidence without ornament: solid fills or borders, no shadow, no gradient,
// small institutional radius, weight 500.
const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium whitespace-nowrap transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white border border-accent hover:bg-fund hover:border-fund",
  outline: "bg-surface text-text border border-border-strong hover:border-text",
  ghost: "text-text-2 hover:text-text",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.85rem]",
  md: "px-5 py-2.5 text-[0.92rem]",
  lg: "px-6 py-3 text-[0.98rem]",
};

type ButtonProps = ComponentPropsWithoutRef<"a"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md") =>
  cn(base, variants[variant], sizes[size]);
