import type { Metadata } from "next";
import { allEntries, getEntry } from "@/lib/portfolio";
import { ProfileView } from "@/components/portfolio/blocks";

export function generateStaticParams() {
  return allEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEntry(slug);
  if (!e) return { title: "Portfolio" };
  return { title: `${e.name} — RAI portfolio`, description: e.tagline.en };
}

export default async function EntryProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = getEntry(slug) ?? null;
  return <ProfileView slug={slug} seed={seed} />;
}
