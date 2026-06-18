import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, httpOnly session for the RAI OS workspace. Payload is base64url JSON +
// HMAC-SHA256 signature. The RAI Social access token stays server-side (in the
// httpOnly cookie), never exposed to client JS.
const COOKIE = "rai_session";
const SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  userId: string;
  username: string;
  name: string;
  avatar: string;
  token: string; // RAI Social access token (server-only)
  iat: number;
};

function b64url(buf: Buffer): string { return buf.toString("base64url"); }
function sign(data: string): string { return createHmac("sha256", SECRET).update(data).digest("base64url"); }

function serialize(s: Session): string {
  const payload = b64url(Buffer.from(JSON.stringify(s)));
  return `${payload}.${sign(payload)}`;
}

function parse(value: string): Session | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()) as Session; }
  catch { return null; }
}

export async function setSession(s: Omit<Session, "iat">): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, serialize({ ...s, iat: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  return v ? parse(v) : null;
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** Public-safe view of the session (no token). */
export function publicUser(s: Session) {
  return { userId: s.userId, username: s.username, name: s.name, avatar: s.avatar };
}
