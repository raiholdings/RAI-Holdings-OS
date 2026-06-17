import type { Metadata } from "next";
import { allPlatforms, getPlatform } from "@/lib/platform";
import { PlatformDetail } from "@/components/platform/PlatformDetail";

export function generateStaticParams() {
  return allPlatforms().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPlatform(slug);
  if (!p) return { title: "Platform" };
  return { title: `${p.name} — RAI Platform`, description: p.shortDescription.en };
}

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = getPlatform(slug) ?? null;
  return <PlatformDetail slug={slug} seed={seed} />;
}
