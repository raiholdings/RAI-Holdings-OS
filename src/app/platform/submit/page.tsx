import { redirect } from "next/navigation";

// Editing moved to the admin area (/admin/platform). Public pages are read-only.
export default function Page() {
  redirect("/admin/platform");
}
