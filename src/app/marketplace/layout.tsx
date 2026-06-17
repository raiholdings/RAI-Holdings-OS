import type { Metadata } from "next";
import { MarketHeader } from "@/components/marketplace/MarketHeader";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "RAI Marketplace — discover, buy, and install apps, MCP servers, and workflows.",
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <MarketHeader />
      {children}
    </div>
  );
}
