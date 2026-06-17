import type { Metadata } from "next";
import { PricingHeader } from "@/components/pricing/PricingHeader";

export const metadata: Metadata = { title: "Pricing admin", description: "RAI Pricing admin — plans, compare table, review queue, versions." };

export default function AdminPricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PricingHeader />
      {children}
    </div>
  );
}
