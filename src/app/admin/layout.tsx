import type { Metadata } from "next";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();
  if (!authed) return <AdminLogin />;
  return <AdminShell>{children}</AdminShell>;
}
