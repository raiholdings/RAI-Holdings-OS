import { NextRequest, NextResponse } from "next/server";
import { listPlatforms, type CompanySize, type Deployment, type PlatformType, type PricingModel, type SourceType } from "@/lib/platform";

export const dynamic = "force-dynamic";

/** GET /api/platform/v0/platforms?search=&category=&pricing=&deployment=&platformType=&companySize=&source=&rai=&openSource=&minRating=&sort=&page= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const bool = (v: string | null) => (v == null ? undefined : v === "true");
  const res = listPlatforms({
    search: sp.get("search") || undefined,
    category: sp.get("category") || undefined,
    pricing: (sp.get("pricing") as PricingModel) || undefined,
    deployment: (sp.get("deployment") as Deployment) || undefined,
    platformType: (sp.get("platformType") as PlatformType) || undefined,
    companySize: (sp.get("companySize") as CompanySize) || undefined,
    source: (sp.get("source") as SourceType) || undefined,
    rai: bool(sp.get("rai")),
    openSource: bool(sp.get("openSource")),
    minRating: sp.get("minRating") ? Number(sp.get("minRating")) : undefined,
    sort: (sp.get("sort") as "rating" | "reviews" | "newest" | "az") || undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
  });
  return NextResponse.json(res, { headers: { "cache-control": "no-store" } });
}
