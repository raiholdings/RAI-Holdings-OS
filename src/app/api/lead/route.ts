import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lead capture endpoint (satellite landings + main site).
 *
 * Accepts { name, phone, email, source, venture }. Requires at least one usable
 * contact (valid email OR phone). For now it logs the lead; Pha 2 (lead thật)
 * forwards to Telegram + Resend and persists to D1.
 */
type LeadBody = { name?: string; phone?: string; email?: string; source?: string; venture?: string };

const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rePhone = /^[0-9+\s().-]{8,}$/;

export async function POST(req: Request) {
  let body: LeadBody = {};
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const source = (body.source ?? "").trim() || "raiholdings.vn";
  const venture = (body.venture ?? "").trim();

  if (!reEmail.test(email) && !rePhone.test(phone)) {
    return NextResponse.json({ ok: false, error: "missing_contact" }, { status: 422 });
  }

  // TODO (Pha 2 — lead thật): forward to Telegram + Resend; persist to D1.
  console.log(`[lead] ${source}${venture ? " · " + venture : ""} | ${name || "(no name)"} | ${phone || "-"} | ${email || "-"} @ ${new Date().toISOString()}`);

  return NextResponse.json({ ok: true });
}
