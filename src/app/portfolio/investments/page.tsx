import type { Metadata } from "next";
import { listEntries } from "@/lib/portfolio";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = { title: "Investments — Portfolio", description: "RAI investment portfolio." };

export default function Investments() {
  return <PortfolioView seed={listEntries()} tab="investments" />;
}
