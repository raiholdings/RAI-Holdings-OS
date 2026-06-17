import { NextResponse } from "next/server";
import { categoryTree } from "@/lib/platform";

export const dynamic = "force-dynamic";

/** GET /api/platform/v0/categories — hierarchical taxonomy */
export function GET() {
  return NextResponse.json({ tree: categoryTree() }, { headers: { "cache-control": "no-store" } });
}
