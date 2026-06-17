import type { Metadata } from "next";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "RAI Holdings portfolio — member companies and incubated startups in the ecosystem.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PortfolioHeader />
      {children}
    </div>
  );
}
