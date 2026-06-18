import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata = { title: "RAI OS Workspace" };

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
