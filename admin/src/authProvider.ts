import type { AuthProvider } from "@refinedev/core";
import { supabaseClient, readClaims } from "./supabaseClient";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error };
    if (data?.session) return { success: true, redirectTo: "/" };
    return { success: false, error: { name: "Login failed", message: "Invalid credentials" } };
  },
  logout: async () => {
    await supabaseClient.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const { data } = await supabaseClient.auth.getSession();
    return data.session ? { authenticated: true } : { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => {
    const { data } = await supabaseClient.auth.getSession();
    return readClaims(data.session?.access_token).user_role ?? null;
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, name: data.user.email, email: data.user.email };
  },
  onError: async (error) => ({ error }),
};
