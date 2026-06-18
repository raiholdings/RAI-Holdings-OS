"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useCurrentOrg, useOrgs, refreshRemote, type Role } from "@/lib/workspace-store";

const WRAP = "mx-auto max-w-[820px] px-5 py-8 sm:px-8";
const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

type Member = { raiUserId: string; role: Role; name: string; username: string; avatar: string };

const roleTone: Record<Role, string> = {
  owner: "bg-accent/10 text-accent",
  admin: "bg-ok/15 text-ok",
  member: "bg-bg text-text-2",
};

export default function WorkspaceOrgPage() {
  const { tr, lang } = useLang();
  const orgs = useOrgs();
  const org = useCurrentOrg();
  const myRole = org?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const [dbOn, setDbOn] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [newOrg, setNewOrg] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<Role, "owner">>("member");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!org) return;
    const res = await fetch(`/api/workspace/v0/orgs/${org.id}/members`, { credentials: "include" });
    if (res.status === 501) { setDbOn(false); return; }
    const j = await res.json().catch(() => ({}));
    if (j.db === false) { setDbOn(false); return; }
    setDbOn(true);
    setMembers(j.members ?? []);
  }, [org]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  async function createOrg() {
    if (newOrg.trim().length < 2) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/workspace/v0/orgs", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newOrg.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewOrg("");
      await refreshRemote();
      setMsg({ kind: "ok", text: tr(t("Organization created.", "Đã tạo tổ chức.")) });
    } catch { setMsg({ kind: "err", text: tr(t("Could not create the organization.", "Không tạo được tổ chức.")) }); }
    finally { setBusy(false); }
  }

  async function sendInvite() {
    if (!org || !invite.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/workspace/v0/orgs/${org.id}/members`, {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: invite.trim(), role: inviteRole }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = j.error === "user_not_found"
          ? tr(t("No RAI Social user with that username.", "Không có người dùng RAI Social với username đó."))
          : tr(t("Could not add the member.", "Không thêm được thành viên."));
        throw new Error(text);
      }
      setInvite("");
      await loadMembers();
      setMsg({ kind: "ok", text: tr(t("Member added.", "Đã thêm thành viên.")) });
    } catch (e) { setMsg({ kind: "err", text: e instanceof Error && e.message ? e.message : tr(t("Failed.", "Thất bại.")) }); }
    finally { setBusy(false); }
  }

  async function changeRole(uid: string, role: Role) {
    if (!org) return;
    await fetch(`/api/workspace/v0/orgs/${org.id}/members/${uid}`, {
      method: "PATCH", credentials: "include", headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    loadMembers();
  }

  async function removeMember(uid: string) {
    if (!org) return;
    await fetch(`/api/workspace/v0/orgs/${org.id}/members/${uid}`, { method: "DELETE", credentials: "include" });
    loadMembers();
  }

  return (
    <div className={WRAP}>
      <div className="label mb-2 text-accent">{tr(t("Organization", "Tổ chức"))}</div>
      <h1 className="text-[1.5rem] font-medium tracking-tight text-text">{org?.name}</h1>
      <p className="mono mt-1 text-[0.8rem] text-text-2">
        {fmtVnd(org?.balanceVnd ?? 0)}{myRole ? ` · ${tr(t("your role", "vai trò của bạn"))}: ${myRole}` : ""}
      </p>

      {/* DB-off notice */}
      {dbOn === false && (
        <div className="mt-6 border border-dashed border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <Icon name="database" size={18} className="mt-0.5 text-text-2" />
            <div>
              <p className="text-[0.92rem] font-medium text-text">{tr(t("Persistence is off", "Chưa bật cơ sở dữ liệu"))}</p>
              <p className="mt-1 text-[0.86rem] text-text-2">
                {tr(t(
                  "Multiple organizations and team members need the database. Set SUPABASE_URL + service role on the server to enable this. Workspace data is currently kept on this device only.",
                  "Nhiều tổ chức và thành viên cần cơ sở dữ liệu. Đặt SUPABASE_URL + service role trên máy chủ để bật. Hiện dữ liệu workspace chỉ lưu trên thiết bị này.",
                ))}
              </p>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <p className={cn("mt-4 text-[0.86rem]", msg.kind === "ok" ? "text-ok" : "text-err")}>{msg.text}</p>
      )}

      {dbOn && (
        <>
          {/* members */}
          <section className="mt-8">
            <h2 className="text-[1.05rem] font-medium text-text">{tr(t("Members", "Thành viên"))}</h2>
            <div className="mt-3 divide-y divide-border border border-border bg-surface">
              {members.map((m) => (
                <div key={m.raiUserId} className="flex items-center gap-3 px-4 py-3">
                  {m.avatar
                    ? <img src={m.avatar} alt="" className="size-8 rounded-full object-cover" />
                    : <span className="grid size-8 place-items-center rounded-full bg-accent/10 text-[0.7rem] font-medium text-accent">{(m.name || m.username || "U").slice(0, 1).toUpperCase()}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.9rem] text-text">{m.name || m.username}</div>
                    {m.username && <div className="mono truncate text-[0.72rem] text-text-2">@{m.username}</div>}
                  </div>
                  <span className={cn("mono rounded-[var(--radius-md)] px-2 py-0.5 text-[0.62rem] uppercase tracking-wider", roleTone[m.role])}>{m.role}</span>
                  {myRole === "owner" && m.role !== "owner" && (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.raiUserId, e.target.value as Role)}
                      aria-label={tr(t("Role", "Vai trò"))}
                      className="rounded-[var(--radius-md)] border border-border bg-bg px-2 py-1 text-[0.78rem] text-text"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                  {canManage && m.role !== "owner" && (
                    <button onClick={() => removeMember(m.raiUserId)} aria-label={tr(t("Remove", "Xoá"))} className="text-text-2 hover:text-err">
                      <Icon name="x" size={15} />
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && <div className="px-4 py-6 text-center text-[0.86rem] text-text-2">{tr(t("No members yet.", "Chưa có thành viên."))}</div>}
            </div>

            {/* invite */}
            {canManage && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder={tr(t("RAI Social username", "Username RAI Social"))}
                  className="min-w-[200px] flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-text"
                />
                {myRole === "owner" && (
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Exclude<Role, "owner">)} className="rounded-[var(--radius-md)] border border-border bg-bg px-2.5 py-2 text-[0.84rem] text-text">
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                )}
                <button onClick={sendInvite} disabled={busy || !invite.trim()} className={buttonClass("primary", "md")}>
                  <Icon name="user" size={15} /> {tr(t("Add member", "Thêm thành viên"))}
                </button>
              </div>
            )}
          </section>

          {/* create org */}
          <section className="mt-10">
            <h2 className="text-[1.05rem] font-medium text-text">{tr(t("Create organization", "Tạo tổ chức"))}</h2>
            <p className="mt-1 text-[0.86rem] text-text-2">{tr(t("You currently belong to", "Bạn đang thuộc"))} {orgs.length} {tr(t("organization(s).", "tổ chức."))}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder={tr(t("New organization name", "Tên tổ chức mới"))}
                className="min-w-[220px] flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-text"
              />
              <button onClick={createOrg} disabled={busy || newOrg.trim().length < 2} className={buttonClass("outline", "md")}>
                <Icon name="building" size={15} /> {tr(t("Create", "Tạo"))}
              </button>
            </div>
          </section>
        </>
      )}

      <p className="mono mt-10 text-[0.7rem] text-text-2">{lang === "vi" ? "RBAC: owner quản trị toàn quyền · admin mời/xoá thành viên · member chỉ xem." : "RBAC: owner full control · admin invites/removes members · member read-only."}</p>
    </div>
  );
}
