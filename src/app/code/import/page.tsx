import { redirect } from "next/navigation";

// Editing moved to the admin area (/admin/code). Public pages are read-only.
export default function Page() {
  redirect("/admin/code");
}
