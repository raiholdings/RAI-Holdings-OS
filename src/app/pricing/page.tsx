import { getPricingPage } from "@/lib/pricing";
import { PricingView } from "@/components/pricing/PricingView";

export default function Pricing() {
  return <PricingView seed={getPricingPage()} />;
}
