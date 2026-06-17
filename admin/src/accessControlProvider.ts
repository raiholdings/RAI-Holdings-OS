import type { AccessControlProvider } from "@refinedev/core";
import { supabaseClient, readClaims } from "./supabaseClient";

/**
 * RBAC at the UI layer, mirroring the DB (iam.has_permission). The real gate is
 * Postgres RLS; this just hides/disables UI a role can't use.
 *   owner/admin → everything · editor → content write · viewer → read-only
 * Refine actions: list/show=read, create/edit/delete=write.
 */
const WRITE_ACTIONS = new Set(["create", "edit", "delete", "clone"]);

export const accessControlProvider: AccessControlProvider = {
  can: async ({ action }) => {
    const { data } = await supabaseClient.auth.getSession();
    const role = readClaims(data.session?.access_token).user_role ?? "viewer";
    if (role === "owner" || role === "admin") return { can: true };
    if (role === "editor") return { can: true }; // refine per-resource scoping can tighten later
    // viewer
    return { can: !WRITE_ACTIONS.has(action), reason: "Viewers have read-only access." };
  },
  options: { buttons: { enableAccessControl: true, hideIfUnauthorized: true } },
};
