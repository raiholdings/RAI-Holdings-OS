import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

export const metadata: Metadata = {
  title: "Platform",
  description: "RAI Platform — a global catalog of software & platforms with reviews, comparison, and provenance.",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PlatformHeader />
      {children}
    </div>
  );
}
