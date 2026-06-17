import type { Metadata } from "next";
import { McpHeader } from "@/components/mcp/McpHeader";

export const metadata: Metadata = {
  title: "MCP Registry",
  description: "RAI MCP Registry — discover and install MCP servers (compatible with the Official MCP Registry API).",
};

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <McpHeader />
      {children}
    </div>
  );
}
