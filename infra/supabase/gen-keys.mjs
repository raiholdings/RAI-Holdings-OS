#!/usr/bin/env node
// Generate Supabase ANON_KEY + SERVICE_ROLE_KEY (HS256 JWTs signed with JWT_SECRET).
// Usage:  JWT_SECRET="<your-jwt-secret>" node gen-keys.mjs
// No dependencies — uses node:crypto. Keys are valid for 10 years.
import { createHmac } from "node:crypto";

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error("Set JWT_SECRET (>= 32 chars). Example:\n  JWT_SECRET=\"$(openssl rand -base64 48)\" node gen-keys.mjs");
  process.exit(1);
}

const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function sign(payload) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${data}.${sig}`;
}

const iat = Math.floor(Date.now() / 1000);
const exp = iat + 60 * 60 * 24 * 365 * 10; // 10 years
const make = (role) => sign({ role, iss: "supabase", iat, exp });

console.log("\nANON_KEY=" + make("anon"));
console.log("\nSERVICE_ROLE_KEY=" + make("service_role"));
console.log("\n# Paste these into ./.env. Keep SERVICE_ROLE_KEY server-side only.\n");
