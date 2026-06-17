import type { Metadata } from "next";
import { getAboutPage } from "@/lib/about";
import { AboutView } from "@/components/about/blocks";

export function generateMetadata(): Metadata {
  const page = getAboutPage("about")!;
  return { title: page.seoTitle.en, description: page.seoDescription.en };
}

export default function AboutHome() {
  const page = getAboutPage("about")!;
  return <AboutView blocks={page.blocks} />;
}
