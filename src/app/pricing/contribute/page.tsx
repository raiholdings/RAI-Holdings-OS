import { redirect } from "next/navigation";

// Editing moved to the admin area (/admin/pricing). Public pages are read-only.
export default function Page() {
  redirect("/admin/pricing");
}
