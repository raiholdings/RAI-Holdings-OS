import type { Metadata } from "next";
import { listEntries } from "@/lib/portfolio";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = { title: "Platform development — Portfolio", description: "RAI platforms across Tech Business, SaaS, and Community pillars." };

export default function Platforms() {
  return <PortfolioView seed={listEntries()} tab="platforms" />;
}
