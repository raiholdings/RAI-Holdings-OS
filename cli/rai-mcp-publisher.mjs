#!/usr/bin/env node
/**
 * rai-mcp-publisher — internal CLI for the RAI MCP Registry (Phase 5).
 * Modeled on `mcp-publisher`. No dependencies (Node 18+, global fetch).
 *
 *   rai-mcp init [name]              create a server.json template
 *   rai-mcp login <token> [--registry <url>]   save credentials
 *   rai-mcp whoami                   show saved credentials
 *   rai-mcp publish [file]           publish server.json (default ./server.json)
 *   rai-mcp logout                   clear credentials
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CRED_DIR = join(homedir(), ".rai-mcp");
const CRED_FILE = join(CRED_DIR, "credentials.json");
const DEFAULT_REGISTRY = process.env.RAI_MCP_REGISTRY || "http://localhost:4173";
const SCHEMA = "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json";

const C = { dim: "\x1b[2m", b: "\x1b[1m", g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", c: "\x1b[36m", x: "\x1b[0m" };
const log = (...a) => console.log(...a);
const ok = (m) => log(`${C.g}✓${C.x} ${m}`);
const err = (m) => { console.error(`${C.r}✗${C.x} ${m}`); process.exit(1); };

function loadCreds() {
  try { return JSON.parse(readFileSync(CRED_FILE, "utf8")); } catch { return {}; }
}
function saveCreds(c) {
  if (!existsSync(CRED_DIR)) mkdirSync(CRED_DIR, { recursive: true });
  writeFileSync(CRED_FILE, JSON.stringify(c, null, 2));
}

function template(name) {
  const short = name.split("/").slice(1).join("/") || "my-server";
  return {
    $schema: SCHEMA,
    name,
    title: short.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    description: "Mô tả ngắn về MCP server của bạn.",
    websiteUrl: "https://raiholdings.vn",
    repository: { url: `https://github.com/rai/${short}`, source: "github" },
    version: "1.0.0",
    packages: [
      {
        registryType: "npm",
        registryBaseUrl: "https://registry.npmjs.org",
        identifier: `@rai/${short}`,
        version: "1.0.0",
        transport: { type: "stdio" },
        environmentVariables: [{ name: "RAI_API_KEY", description: "Khóa API nội bộ RAI", isRequired: true, isSecret: true }],
      },
    ],
  };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (!cmd || cmd === "help" || cmd === "--help") {
    log(`${C.b}rai-mcp-publisher${C.x} — RAI MCP Registry CLI\n`);
    log(`  ${C.c}init${C.x} [name]                  create a server.json template`);
    log(`  ${C.c}login${C.x} <token> [--registry u]  save credentials (vn.rai/* → rai_… · io.github/* → ghp_…)`);
    log(`  ${C.c}whoami${C.x}                        show saved credentials`);
    log(`  ${C.c}publish${C.x} [file]               publish server.json (default ./server.json)`);
    log(`  ${C.c}logout${C.x}                        clear credentials`);
    log(`\n  registry: ${C.dim}${loadCreds().registry || DEFAULT_REGISTRY}${C.x}  (override via $RAI_MCP_REGISTRY)`);
    return;
  }

  if (cmd === "init") {
    const name = rest[0] || "vn.rai/my-server";
    if (existsSync("server.json")) err("server.json already exists");
    writeFileSync("server.json", JSON.stringify(template(name), null, 2));
    ok(`Created ${C.b}server.json${C.x} for ${C.c}${name}${C.x}`);
    log(`${C.dim}Edit it, then: rai-mcp publish${C.x}`);
    return;
  }

  if (cmd === "login") {
    const token = rest.find((a) => !a.startsWith("--"));
    const regIdx = rest.indexOf("--registry");
    const registry = regIdx >= 0 ? rest[regIdx + 1] : DEFAULT_REGISTRY;
    if (!token) err("usage: rai-mcp login <token> [--registry <url>]");
    saveCreds({ token, registry });
    ok(`Logged in to ${C.c}${registry}${C.x}`);
    return;
  }

  if (cmd === "logout") { saveCreds({}); ok("Cleared credentials"); return; }

  if (cmd === "whoami") {
    const c = loadCreds();
    if (!c.token) { log(`${C.y}Not logged in.${C.x} Run: rai-mcp login <token>`); return; }
    const masked = c.token.slice(0, 6) + "…" + c.token.slice(-3);
    log(`registry: ${C.c}${c.registry || DEFAULT_REGISTRY}${C.x}`);
    log(`token:    ${C.dim}${masked}${C.x}`);
    return;
  }

  if (cmd === "publish") {
    const file = rest[0] || "server.json";
    const creds = loadCreds();
    const registry = creds.registry || DEFAULT_REGISTRY;
    if (!creds.token) err("not logged in — run: rai-mcp login <token>");
    let server;
    try { server = JSON.parse(readFileSync(file, "utf8")); } catch { err(`cannot read ${file}`); }
    log(`Publishing ${C.b}${server.name}@${server.version}${C.x} → ${C.dim}${registry}${C.x}`);
    let res;
    try {
      res = await fetch(`${registry}/api/mcp/v0/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${creds.token}` },
        body: JSON.stringify(server),
      });
    } catch (e) { err(`network error: ${e.message}`); }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) {
      err(`rejected (${res.status}):\n   ${(body.errors || [body.error || "unknown"]).join("\n   ")}`);
    }
    ok(`Published ${C.c}${server.name}${C.x} (id: ${body.id})`);
    log(`${C.dim}${registry}/mcp/${server.name.split("/")[0]}/${server.name.split("/").slice(1).join("/")}${C.x}`);
    return;
  }

  err(`unknown command '${cmd}' — run: rai-mcp help`);
}

main();
