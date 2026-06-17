import { listEntries } from "@/lib/portfolio";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export default function Portfolio() {
  return <PortfolioView seed={listEntries()} tab="all" />;
}
