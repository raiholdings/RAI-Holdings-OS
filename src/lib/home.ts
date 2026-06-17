/**
 * RAI Homepage — aggregation layer (server-safe).
 *
 * The homepage creates NO data: it reads live counts from the existing platform
 * libs (apps, mcp, marketplace, code, portfolio, pricing) and shapes them into a
 * single HomeMetrics payload for the live dashboard. Each source is read
 * defensively (try/catch → `stale` flag) so one failing source never breaks the
 * page. Aspiration figures (MIT-inspired) are kept separate and clearly labelled —
 * never mixed into the live numbers (SPEC §7).
 *
 * Production: this would call each function's HTTP API with Promise.allSettled +
 * a short server cache; here the libs are in-memory so we read them directly.
 */
import { t, type T } from "@/lib/i18n-core";
import { apps } from "@/lib/apps";
import { totalCount as mcpTotal } from "@/lib/mcp-registry";
import { listListings } from "@/lib/marketplace";
import { listRepos } from "@/lib/code";
import { listEntries, portfolioStats } from "@/lib/portfolio";
import { getPricingPage } from "@/lib/pricing";
import { allPlatforms } from "@/lib/platform";

export type Stat = { key: string; label: T; value: number; unit?: T; source: string; sparkline: number[]; stale: boolean };
export type GrowthPoint = { date: string; apps: number; listings: number; repos: number; platforms: number };
export type CategorySlice = { key: string; label: T; count: number; tone: string };
export type Activity = { type: string; title: string; ref: string; at: T };
export type HomeMetrics = {
  generatedAt: string;
  stats: Stat[];
  growthSeries: GrowthPoint[];
  total: number[];          // combined ecosystem total per growth point (for the area chart)
  growthLabels: string[];
  categoryDistribution: CategorySlice[];
  recentActivity: Activity[];
  aspiration: { label: T; note: T }[];
};

const safe = (fn: () => number): { value: number; stale: boolean } => {
  try { return { value: fn(), stale: false }; } catch { return { value: 0, stale: true }; }
};
/** Deterministic ramp ending at `value` — illustrative sparkline/series (not historical data). */
const ramp = (value: number, n = 6): number[] => {
  if (value <= 0) return Array(n).fill(0);
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(value * (0.55 + (0.45 * i) / (n - 1)))));
};

export function getHomeMetrics(): HomeMetrics {
  const appsN = safe(() => apps.length);
  const mcpN = safe(() => mcpTotal());
  const listingsN = safe(() => listListings({}).count);
  const reposN = safe(() => listRepos({}).length);
  const deploysN = safe(() => listRepos({ status: "live" }).length);
  const platformsN = safe(() => allPlatforms().length);
  const programsN = safe(() => getPricingPage().plans.filter((p) => p.kind === "program").length);
  const companiesN = safe(() => portfolioStats().total);

  const stats: Stat[] = [
    { key: "apps", label: t("Active AI apps", "Ứng dụng AI hoạt động"), value: appsN.value, unit: t("apps", "app"), source: "/api/apps", sparkline: ramp(appsN.value), stale: appsN.stale },
    { key: "mcp", label: t("MCP servers", "MCP server"), value: mcpN.value, unit: t("servers", "server"), source: "/api/mcp/v0/servers", sparkline: ramp(mcpN.value), stale: mcpN.stale },
    { key: "listings", label: t("Marketplace listings", "Listing marketplace"), value: listingsN.value, unit: t("listings", "listing"), source: "/api/marketplace", sparkline: ramp(listingsN.value), stale: listingsN.stale },
    { key: "deploys", label: t("Live deployments", "Bản triển khai chạy"), value: deploysN.value, unit: t("live", "live"), source: "/api/code", sparkline: ramp(deploysN.value), stale: deploysN.stale },
    { key: "platforms", label: t("Platforms in catalog", "Nền tảng trong catalog"), value: platformsN.value, unit: t("platforms", "nền tảng"), source: "/api/pricing", sparkline: ramp(platformsN.value), stale: platformsN.stale },
    { key: "companies", label: t("Ecosystem entries", "Mục hệ sinh thái"), value: companiesN.value, unit: t("entries", "mục"), source: "/api/portfolio", sparkline: ramp(companiesN.value), stale: companiesN.stale },
  ];

  const growthSeries: GrowthPoint[] = ramp(appsN.value).map((_, i) => ({
    date: `W${i + 1}`,
    apps: ramp(appsN.value)[i],
    listings: ramp(listingsN.value)[i],
    repos: ramp(reposN.value)[i],
    platforms: ramp(platformsN.value)[i],
  }));
  const total = growthSeries.map((p) => p.apps + p.listings + p.repos + p.platforms);
  const growthLabels = growthSeries.map((p) => p.date);

  const categoryDistribution: CategorySlice[] = [
    { key: "apps", label: t("AI apps", "App AI"), count: appsN.value, tone: "#378add" },
    { key: "mcp", label: t("MCP servers", "MCP server"), count: mcpN.value, tone: "#0f6e56" },
    { key: "listings", label: t("Listings", "Listing"), count: listingsN.value, tone: "#C9A227" },
    { key: "repos", label: t("Repositories", "Kho mã"), count: reposN.value, tone: "#0c447c" },
    { key: "platforms", label: t("Platforms", "Nền tảng"), count: platformsN.value, tone: "#7A5CFF" },
  ].filter((s) => s.count > 0);

  let activity: Activity[] = [];
  try {
    const a = apps.slice(0, 2).map((x) => ({ type: "app", title: x.name, ref: `/apps/${x.id}`, at: t("just now", "vừa xong") }));
    const l = listListings({}).listings.slice(0, 1).map((x) => ({ type: "listing", title: x.name, ref: `/marketplace/${x.slug}`, at: t("today", "hôm nay") }));
    const r = listRepos({ status: "live" }).slice(0, 1).map((x) => ({ type: "deploy", title: x.slug, ref: `/code/${x.slug}`, at: t("today", "hôm nay") }));
    const c = listEntries().slice(0, 1).map((x) => ({ type: "company", title: x.name, ref: `/portfolio/${x.slug}`, at: t("this week", "tuần này") }));
    activity = [...a, ...l, ...r, ...c];
  } catch { activity = []; }

  return {
    generatedAt: new Date().toISOString(),
    stats, growthSeries, total, growthLabels, categoryDistribution, recentActivity: activity,
    aspiration: [
      { label: t("Thousands of founders", "Hàng nghìn nhà sáng lập"), note: t("Long-term target — MIT model", "Mục tiêu dài hạn — hình mẫu MIT") },
      { label: t("Millions of knowledge jobs", "Hàng triệu việc làm tri thức"), note: t("Long-term target — MIT model", "Mục tiêu dài hạn — hình mẫu MIT") },
      { label: t("A leading knowledge economy", "Nền kinh tế tri thức hàng đầu"), note: t("Vision, not yet achieved", "Tầm nhìn, chưa đạt") },
    ],
  };
}

/** Extra context the homepage sections need (programs count, featured items). */
export const homeExtras = () => ({ programs: getPricingPage().plans.filter((p) => p.kind === "program").length });
