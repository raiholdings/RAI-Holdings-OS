"use client";

import { useEffect } from "react";
import type { EnterprisePage } from "@/lib/enterprise";
import { effectivePage, hydrateStore, useOverride } from "@/lib/enterprise-store";
import { BlockRenderer } from "@/components/enterprise/blocks";

/**
 * Renders a landing page block-by-block. The server passes the published seed
 * page (SSR/SEO); on the client we apply any admin overrides from the store so
 * edits/publishes made in /admin/enterprise are reflected live.
 */
export function LandingView({ seed }: { seed: EnterprisePage }) {
  useEffect(() => { hydrateStore(); }, []);
  useOverride(seed.id); // subscribe → re-render when admin edits this page
  const page = effectivePage(seed);
  const blocks = [...page.blocks].filter((b) => b.status === "published").sort((a, b) => a.order - b.order);
  return <>{blocks.map((b) => <BlockRenderer key={b.id} block={b} />)}</>;
}
