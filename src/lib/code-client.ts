"use client";

import type { Repo, License, DeployStatus } from "@/lib/code";

export async function fetchRepos(params: { search?: string; license?: string; language?: string; status?: DeployStatus } = {}): Promise<Repo[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.license) qs.set("license", params.license);
  if (params.language) qs.set("language", params.language);
  if (params.status) qs.set("status", params.status);
  const res = await fetch(`/api/code/v0/repos?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()).repos ?? [];
}

export async function fetchRepo(owner: string, name: string): Promise<Repo | null> {
  const res = await fetch(`/api/code/v0/repos/${owner}/${name}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLicenses(): Promise<License[]> {
  const res = await fetch(`/api/code/v0/licenses`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()).licenses ?? [];
}
