import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { ensureOrgs, patchVenture, removeVenture } from "@/lib/workspace-repo";
import type { Venture } from "@/lib/workspace";

export const dynamic = "force-dynamic";

// PATCH { status?, data? } → update a venture (scoped to the user's orgs).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string; data?: Venture };
  try {
    const orgs = await ensureOrgs(session.userId, session.name || session.username);
    await patchVenture(id, orgs.map((o) => o.id), body);
    return NextResponse.json({ db: true, ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}

// DELETE → remove a venture (scoped to the user's orgs).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id } = await params;
  try {
    const orgs = await ensureOrgs(session.userId, session.name || session.username);
    await removeVenture(id, orgs.map((o) => o.id));
    return NextResponse.json({ db: true, ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
