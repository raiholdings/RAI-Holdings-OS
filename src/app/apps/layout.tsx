import type { Metadata } from "next";
import { AppsHeader } from "@/components/apps/AppsHeader";

export const metadata: Metadata = {
  title: "Apps",
  description: "RAI Apps — AI-native apps that run inside the conversation (MCP Apps, SEP-1865).",
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <AppsHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
