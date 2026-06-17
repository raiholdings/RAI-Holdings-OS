import type { Metadata } from "next";
import { AboutNav } from "@/components/about/AboutNav";

export const metadata: Metadata = {
  title: "Company",
  description: "About RAI Holdings — an AI-native venture builder for Vietnam's knowledge economy.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <AboutNav />
      {children}
    </div>
  );
}
