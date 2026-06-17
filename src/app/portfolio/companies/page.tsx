import type { Metadata } from "next";
import { listEntries } from "@/lib/portfolio";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = { title: "Member companies — Portfolio", description: "RAI member companies (legal corporate entities)." };

export default function Companies() {
  return <PortfolioView seed={listEntries()} tab="companies" />;
}
