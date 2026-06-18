import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VentureLanding } from "@/components/ventures/VentureLanding";
import { allVentureSlugs, getVenture } from "@/lib/ventures";

export function generateStaticParams() {
  return allVentureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVenture(slug);
  return v ? { title: `${v.name} · Workspace` } : {};
}

// Platform landing rendered INSIDE the workspace shell — an app surface in RAI OS.
export default async function WorkspacePlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVenture(slug);
  if (!v) notFound();
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-6 sm:px-8">
      <Link
        href="/workspace"
        className="mb-5 inline-flex items-center gap-1.5 text-[0.85rem] text-text-2 transition-colors hover:text-text"
      >
        <Icon name="arrow-up-right" size={14} className="rotate-[225deg]" />
        {"RAI platforms"}
      </Link>
      <VentureLanding v={v} />
    </main>
  );
}
