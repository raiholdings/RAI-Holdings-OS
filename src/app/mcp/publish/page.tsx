import { redirect } from "next/navigation";

// Editing moved to the admin area (/admin/mcp). Public pages are read-only.
export default function Page() {
  redirect("/admin/mcp");
}
