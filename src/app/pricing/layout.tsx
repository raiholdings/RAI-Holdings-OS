import type { Metadata } from "next";
import { PricingHeader } from "@/components/pricing/PricingHeader";

export const metadata: Metadata = {
  title: "Pricing",
  description: "RAI OS pricing — plans for every business, including AI-native programs. Prices in VND.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PricingHeader />
      {children}
    </div>
  );
}
