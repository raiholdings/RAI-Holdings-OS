import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ tab?: string; next?: string }> }) {
  const sp = await searchParams;
  // Already signed in → go straight to the workspace.
  if (await getSession()) redirect(sp.next || "/workspace");
  const tab = sp.tab === "register" ? "register" : "login";
  return (
    <Suspense>
      <AuthCard initialTab={tab} next={sp.next || "/workspace"} />
    </Suspense>
  );
}
