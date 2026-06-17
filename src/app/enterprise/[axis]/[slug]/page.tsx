import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { axisFromUrl, axisToUrl, getPage, listPages } from "@/lib/enterprise";
import { LandingView } from "@/components/enterprise/LandingView";

export function generateStaticParams() {
  return listPages().map((p) => ({ axis: axisToUrl(p.axis), slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ axis: string; slug: string }> }): Promise<Metadata> {
  const { axis: axisUrl, slug } = await params;
  const axis = axisFromUrl(axisUrl);
  const page = axis ? getPage(axis, slug) : undefined;
  if (!page) return { title: "Enterprise" };
  return { title: page.seoTitle.en, description: page.seoDescription.en };
}

export default async function EnterpriseLanding({ params }: { params: Promise<{ axis: string; slug: string }> }) {
  const { axis: axisUrl, slug } = await params;
  const axis = axisFromUrl(axisUrl);
  const page = axis ? getPage(axis, slug) : undefined;
  if (!page) notFound();
  return <LandingView seed={page} />;
}
