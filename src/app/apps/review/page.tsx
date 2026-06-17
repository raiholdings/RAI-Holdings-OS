import { redirect } from "next/navigation";

// Editing moved to the admin area (/admin/apps). Public pages are read-only.
export default function Page() {
  redirect("/admin/apps");
}
