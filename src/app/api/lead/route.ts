import { NextResponse } from "next/server";

/**
 * Stub lead endpoint. Validates an email and (for now) just logs it.
 * Replace the body with a real integration:
 *   - Email:   Resend / Postmark / SendGrid
 *   - CRM:     HubSpot / Pipedrive
 *   - Storage: Postgres / Supabase / Airtable
 */
export async function POST(req: Request) {
  let email = "";
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const valid = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  // TODO: persist / forward the lead to a real provider.
  console.log(`[lead] ${email} @ ${new Date().toISOString()}`);

  return NextResponse.json({ ok: true });
}
