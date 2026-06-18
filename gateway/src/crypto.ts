// AES-256-GCM encryption for upstream / BYOK provider keys at rest.
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { config } from "./config.js";

function keyBuf(): Buffer {
  const k = config.encryptionKey;
  // accept hex (64 chars) or any string (hashed to 32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(k)) return Buffer.from(k, "hex");
  return createHash("sha256").update(k).digest();
}

/** Returns "iv.tag.ciphertext" (all base64). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuf(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(".");
}

export function decrypt(blob: string): string {
  const [ivB, tagB, ctB] = blob.split(".");
  const decipher = createDecipheriv("aes-256-gcm", keyBuf(), Buffer.from(ivB, "base64"));
  decipher.setAuthTag(Buffer.from(tagB, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ctB, "base64")), decipher.final()]).toString("utf8");
}

/** SHA-256 hex of an API key (we store hashes, never raw keys). */
export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a new RAI API key (returned once) + its hash. */
export function newApiKey(): { key: string; hash: string } {
  const key = "rai-sk-" + randomBytes(24).toString("base64url");
  return { key, hash: hashKey(key) };
}
