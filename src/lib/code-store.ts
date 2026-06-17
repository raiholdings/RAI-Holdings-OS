"use client";

import { useSyncExternalStore } from "react";
import type { Repo } from "@/lib/code";

/* ============================================================
   RAI Code — client state (user repos: create/import/edit/commit/
   deploy/rollback/domains). localStorage. Production: git store +
   container build runner + edge proxy + ACME SSL.
   ============================================================ */

export type Commit = { id: string; message: string; at: string; files: string[] };
export type Deployment = { id: string; status: "queued" | "building" | "ready" | "error"; logs: string[]; url?: string; commit: string; at: string; active: boolean };
export type DomainRec = { id: string; hostname: string; verifyMethod: "CNAME" | "A"; dnsTarget: string; verified: boolean; sslStatus: "pending" | "issued" | "error" };
export type UserRepo = Repo & { commits: Commit[]; deployments: Deployment[]; domains: DomainRec[] };

type State = { repos: UserRepo[]; seq: number };
const KEY = "rai-code-v1";
const EMPTY: State = { repos: [], seq: 0 };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }
function patchRepo(slug: string, fn: (r: UserRepo) => UserRepo) { set({ repos: state.repos.map((r) => (r.slug === slug ? fn(r) : r)) }); }

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); } } catch {}
}

const now = () => new Date().toISOString();
const sid = (p: string) => p + "-" + (state.seq + 1).toString(36);

/* ----------------------------- templates -------------------------------- */
export type Template = "react-vite" | "node-api" | "mcp-server" | "static" | "empty";
export const templateLabels: Record<Template, string> = { "react-vite": "React + Vite", "node-api": "Node API", "mcp-server": "MCP Server", static: "Static site", empty: "Empty" };

function templateFiles(template: Template, name: string): Record<string, string> {
  const readme = `# ${name}\n\nCreated on RAI Code.\n`;
  switch (template) {
    case "react-vite": return { "README.md": readme, "package.json": `{\n  "name": "${name}",\n  "scripts": { "dev": "vite", "build": "vite build" }\n}\n`, "index.html": "<div id=root></div>", "src/main.tsx": "import { createRoot } from 'react-dom/client'\ncreateRoot(document.getElementById('root')!).render(<h1>Hello RAI</h1>)\n" };
    case "node-api": return { "README.md": readme, "package.json": `{\n  "name": "${name}",\n  "scripts": { "start": "node server.js" }\n}\n`, "server.js": "import http from 'node:http'\nhttp.createServer((_,res)=>res.end('ok')).listen(3000)\n" };
    case "mcp-server": return { "README.md": readme, "package.json": `{\n  "name": "${name}",\n  "scripts": { "start": "node mcp.js" }\n}\n`, "mcp.js": "// MCP server — register ui:// resource + tools\n" };
    case "static": return { "README.md": readme, "index.html": "<!doctype html><h1>RAI static site</h1>" };
    default: return { "README.md": readme };
  }
}

/* ----------------------------- mutations -------------------------------- */
export function createRepo(p: { owner: string; name: string; description: string; template: Template; license: string; visibility: "public" | "private" | "internal" }): string {
  const slug = `${p.owner}/${p.name}`;
  const files = templateFiles(p.template, p.name);
  if (p.license) files["LICENSE"] = `SPDX-License-Identifier: ${p.license}\n`;
  const repo: UserRepo = {
    id: sid("repo"), owner: p.owner, name: p.name, slug, description: { en: p.description, vi: p.description },
    visibility: p.visibility, defaultBranch: "main", language: p.template === "node-api" || p.template === "mcp-server" ? ["Node"] : p.template === "react-vite" ? ["TypeScript", "React"] : ["HTML"],
    topics: [], licenseSpdx: p.license, sourceOrigin: "created", starCount: 0, forkCount: 0, updatedAt: now(), deployStatus: "draft", files,
    commits: [{ id: sid("c"), message: "Initial commit", at: now(), files: Object.keys(files) }], deployments: [], domains: [],
  };
  set({ repos: [repo, ...state.repos] });
  return slug;
}

export function importRepo(p: { url: string; name: string; license: string }): string {
  const owner = "me";
  const slug = `${owner}/${p.name}`;
  const files = { "README.md": `# ${p.name}\n\nImported from ${p.url}\n`, "LICENSE": `SPDX-License-Identifier: ${p.license}\n` };
  const repo: UserRepo = {
    id: sid("repo"), owner, name: p.name, slug, description: { en: `Imported from ${p.url}`, vi: `Nhập từ ${p.url}` },
    visibility: "public", defaultBranch: "main", language: ["Unknown"], topics: [], licenseSpdx: p.license,
    sourceOrigin: "imported", upstreamRef: { url: p.url, license: p.license }, starCount: 0, forkCount: 0, updatedAt: now(),
    deployStatus: "draft", files, commits: [{ id: sid("c"), message: `Import from ${p.url}`, at: now(), files: Object.keys(files) }], deployments: [], domains: [],
  };
  set({ repos: [repo, ...state.repos] });
  return slug;
}

export function writeFile(slug: string, path: string, content: string, message: string) {
  patchRepo(slug, (r) => ({ ...r, files: { ...r.files, [path]: content }, updatedAt: now(), commits: [{ id: sid("c"), message: message || `Update ${path}`, at: now(), files: [path] }, ...r.commits] }));
}
export function setLicense(slug: string, spdx: string) {
  patchRepo(slug, (r) => ({ ...r, licenseSpdx: spdx, files: { ...r.files, LICENSE: `SPDX-License-Identifier: ${spdx}\n` }, updatedAt: now() }));
}

export function deploy(slug: string, cfg: { buildCommand: string; outputDir: string; runtime: "static" | "node" | "container" }) {
  const repo = state.repos.find((r) => r.slug === slug);
  if (!repo) return;
  const id = sid("dep");
  const url = `https://${repo.name}-${id.slice(-4)}.apps.raiholdings.vn`;
  const dep: Deployment = { id, status: "building", logs: ["▸ Detecting framework…", `▸ Runtime: ${cfg.runtime}`], url, commit: repo.commits[0]?.id ?? "main", at: now(), active: false };
  patchRepo(slug, (r) => ({ ...r, deployments: [dep, ...r.deployments.map((d) => ({ ...d, active: false }))] }));
  // stream build logs, then go live
  const steps = ["▸ Installing dependencies…", `▸ Running: ${cfg.buildCommand}`, `▸ Output: ${cfg.outputDir}`, "▸ Uploading to CDN…"];
  steps.forEach((line, i) => setTimeout(() => patchRepo(slug, (r) => ({ ...r, deployments: r.deployments.map((d) => d.id === id ? { ...d, logs: [...d.logs, line] } : d) })), 300 * (i + 1)));
  setTimeout(() => patchRepo(slug, (r) => ({ ...r, deployStatus: "live", deployUrl: url, deployments: r.deployments.map((d) => d.id === id ? { ...d, status: "ready", active: true, logs: [...d.logs, "✓ Deployed"] } : { ...d, active: false }) })), 300 * (steps.length + 1));
}

export function rollback(slug: string, deploymentId: string) {
  patchRepo(slug, (r) => {
    const target = r.deployments.find((d) => d.id === deploymentId);
    return { ...r, deployUrl: target?.url, deployments: r.deployments.map((d) => ({ ...d, active: d.id === deploymentId })) };
  });
}

export function addDomain(slug: string, hostname: string) {
  patchRepo(slug, (r) => ({ ...r, domains: [{ id: sid("dom"), hostname, verifyMethod: "CNAME", dnsTarget: "cname.raiholdings.vn", verified: false, sslStatus: "pending" }, ...r.domains] }));
}
export function verifyDomain(slug: string, domainId: string) {
  patchRepo(slug, (r) => ({ ...r, domains: r.domains.map((d) => d.id === domainId ? { ...d, verified: true, sslStatus: "issued" } : d) }));
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const useMyRepos = () => useStore((s) => s.repos);
export const useRepo = (slug: string) => useStore((s) => s.repos.find((r) => r.slug === slug));
