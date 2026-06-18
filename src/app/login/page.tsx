import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERR_MSG: Record<string, string> = {
  oauth_failed: "Đăng nhập RAI Social thất bại. Thử lại.",
  oauth_no_code: "Không nhận được mã uỷ quyền từ RAI Social.",
  oauth_not_configured: "Chưa cấu hình OAuth RAI Social trên máy chủ.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ tab?: string; next?: string; error?: string }> }) {
  const sp = await searchParams;
  // Already signed in → go straight to the workspace.
  if (await getSession()) redirect(sp.next || "/workspace");
  const tab = sp.tab === "register" ? "register" : "login";
  return (
    <Suspense>
      <AuthCard initialTab={tab} next={sp.next || "/workspace"} errorMsg={sp.error ? (ERR_MSG[sp.error] || "Đăng nhập thất bại.") : ""} />
    </Suspense>
  );
}
