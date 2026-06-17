import type { Metadata } from "next";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";

export const metadata: Metadata = { title: "Portfolio admin", description: "RAI Portfolio admin — companies, profiles, AI drafts, review queue, versions." };

export default function AdminPortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PortfolioHeader />
      {children}
    </div>
  );
}
