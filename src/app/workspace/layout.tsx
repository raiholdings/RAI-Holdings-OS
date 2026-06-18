import { redirect } from "next/navigation";
import { getSession, publicUser } from "@/lib/session";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata = { title: "RAI OS Workspace", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/workspace");
  return <WorkspaceShell user={publicUser(session)}>{children}</WorkspaceShell>;
}
