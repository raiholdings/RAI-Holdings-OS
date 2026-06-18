import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { roleOf, listMembers, addMember } from "@/lib/workspace-repo";
import { findRaiSocialUserByUsername, RaiSocialError } from "@/lib/raisocial";

export const dynamic = "force-dynamic";

// GET → list members of the org (any member may view).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id } = await params;
  try {
    if (!(await roleOf(session.userId, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    return NextResponse.json({ db: true, members: await listMembers(id) });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}

// POST { username, role } → invite a RAI Social user (owner/admin only).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { username?: string; role?: string };
  const username = (body.username || "").trim();
  const role = body.role === "admin" ? "admin" : "member";
  if (!username) return NextResponse.json({ error: "bad_username" }, { status: 400 });

  try {
    const myRole = await roleOf(session.userId, id);
    if (myRole !== "owner" && myRole !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (role === "admin" && myRole !== "owner") return NextResponse.json({ error: "owner_only" }, { status: 403 });

    const user = await findRaiSocialUserByUsername(session.token, username);
    await addMember(id, { userId: user.userId, name: user.name, username: user.username, avatar: user.avatar }, role);
    return NextResponse.json({ db: true, member: { raiUserId: user.userId, role, name: user.name, username: user.username, avatar: user.avatar } });
  } catch (e) {
    if (e instanceof RaiSocialError) return NextResponse.json({ error: e.code }, { status: e.code === "user_not_found" ? 404 : 400 });
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
