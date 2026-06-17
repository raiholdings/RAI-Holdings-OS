import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allAboutPages, getAboutPage } from "@/lib/about";
import { AboutView } from "@/components/about/blocks";

export function generateStaticParams() {
  return allAboutPages().filter((p) => p.key !== "about").map((p) => ({ tab: p.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  const page = getAboutPage(tab);
  if (!page) return { title: "Company" };
  return { title: page.seoTitle.en, description: page.seoDescription.en };
}

export default async function AboutSubPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  const page = getAboutPage(tab);
  if (!page || page.key === "about") notFound();
  return <AboutView blocks={page.blocks} />;
}
