import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { roleOf, setMemberRole, removeMember } from "@/lib/workspace-repo";

export const dynamic = "force-dynamic";

// PATCH { role } → change a member's role (owner only; cannot target the owner).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; uid: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id, uid } = await params;
  const { role } = (await req.json().catch(() => ({}))) as { role?: string };
  if (role !== "admin" && role !== "member") return NextResponse.json({ error: "bad_role" }, { status: 400 });

  try {
    if ((await roleOf(session.userId, id)) !== "owner") return NextResponse.json({ error: "owner_only" }, { status: 403 });
    if ((await roleOf(uid, id)) === "owner") return NextResponse.json({ error: "cannot_target_owner" }, { status: 400 });
    await setMemberRole(id, uid, role);
    return NextResponse.json({ db: true, ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}

// DELETE → remove a member. Owner removes anyone but the owner; admin removes members only.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; uid: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id, uid } = await params;
  try {
    const myRole = await roleOf(session.userId, id);
    const targetRole = await roleOf(uid, id);
    if (!targetRole) return NextResponse.json({ db: true, ok: true }); // already gone
    if (targetRole === "owner") return NextResponse.json({ error: "cannot_remove_owner" }, { status: 400 });
    const allowed = myRole === "owner" || (myRole === "admin" && targetRole === "member");
    if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    await removeMember(id, uid);
    return NextResponse.json({ db: true, ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
