import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VentureLanding } from "@/components/ventures/VentureLanding";
import { allVentureSlugs, getVenture } from "@/lib/ventures";

export function generateStaticParams() {
  return allVentureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVenture(slug);
  if (!v) return {};
  return {
    title: `${v.name} — ${v.eyebrow.en}`,
    description: v.subtitle.en,
    openGraph: { title: `${v.name} · RAI Holdings`, description: v.subtitle.en, type: "website" },
  };
}

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVenture(slug);
  if (!v) notFound();
  return <VentureLanding v={v} />;
}
