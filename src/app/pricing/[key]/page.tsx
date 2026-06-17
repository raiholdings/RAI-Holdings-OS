import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlan, getPricingPage } from "@/lib/pricing";
import { PlanDetail } from "@/components/pricing/PlanDetail";

export function generateStaticParams() {
  return getPricingPage().plans.map((p) => ({ key: p.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const plan = getPlan(key);
  if (!plan) return { title: "Pricing" };
  return { title: `${plan.name.en} — RAI OS pricing`, description: plan.tagline.en };
}

export default async function PlanDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const plan = getPlan(key);
  if (!plan) notFound();
  return <PlanDetail plan={plan} />;
}
