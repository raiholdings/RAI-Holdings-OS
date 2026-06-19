import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Card, Table, Tag, Typography, App as AntdApp } from "antd";
import { supabaseClient, readClaims } from "../supabaseClient";

const iam = { schema: "iam" };
const key = (r: string, p: string) => `${r}:${p}`;

export function PermissionMatrix() {
  const { message } = AntdApp.useApp();
  const roles = (useList({ resource: "roles", meta: iam, pagination: { pageSize: 50 } }).data?.data ?? []) as { key: string; label: string }[];
  const perms = (useList({ resource: "permissions", meta: iam, pagination: { pageSize: 200 } }).data?.data ?? []) as { key: string; label: string }[];
  const { data: rpData } = useList({ resource: "role_permissions", meta: iam, pagination: { pageSize: 1000 } });
  const rp = (rpData?.data ?? []) as { role_key: string; permission_key: string }[];

  const [grants, setGrants] = useState<Set<string>>(new Set());
  const [canEdit, setCanEdit] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setGrants(new Set(rp.map((x) => key(x.role_key, x.permission_key)))); }, [rpData]);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      const role = readClaims(data.session?.access_token).user_role;
      setCanEdit(role === "owner" || role === "admin");
    });
  }, []);

  async function toggle(roleKey: string, permKey: string) {
    if (!canEdit || roleKey === "owner") return; // owner luôn full quyền
    const k = key(roleKey, permKey);
    const had = grants.has(k);
    setBusy(k);
    const next = new Set(grants);
    had ? next.delete(k) : next.add(k);
    setGrants(next);
    try {
      const tbl = supabaseClient.schema("iam").from("role_permissions");
      const { error } = had
        ? await tbl.delete().eq("role_key", roleKey).eq("permission_key", permKey)
        : await tbl.insert({ role_key: roleKey, permission_key: permKey });
      if (error) throw error;
    } catch (e) {
      setGrants(grants); // revert
      message.error("Không cập nhật được quyền: " + (e instanceof Error ? e.message : ""));
    } finally { setBusy(null); }
  }

  return (
    <Card title="Ma trận phân quyền (Permissions × Roles)">
      <Typography.Paragraph type="secondary">
        Quyền dạng <code>module.resource.action</code>. {canEdit ? "Bấm vào ô để bật/tắt quyền cho từng vai trò (owner luôn full)." : "Chỉ owner/admin mới sửa được."}
      </Typography.Paragraph>
      <Table dataSource={perms} rowKey="key" size="small" pagination={false} scroll={{ x: true }}>
        <Table.Column dataIndex="key" title="Quyền" fixed="left" render={(v: string, r: { label: string }) => (<div><div style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{r.label}</div></div>)} />
        {roles.map((role) => (
          <Table.Column key={role.key} align="center"
            title={<Tag color={role.key === "owner" ? "gold" : role.key === "admin" ? "green" : role.key === "editor" ? "blue" : "default"}>{role.key}</Tag>}
            render={(_, r: { key: string }) => {
              const on = grants.has(key(role.key, r.key));
              const editable = canEdit && role.key !== "owner";
              return (
                <span
                  onClick={() => editable && toggle(role.key, r.key)}
                  style={{ cursor: editable ? "pointer" : "default", color: on ? "#3B7A57" : "#d0cebf", fontSize: 16, opacity: busy === key(role.key, r.key) ? 0.4 : 1, userSelect: "none" }}
                  title={editable ? (on ? "Bấm để gỡ" : "Bấm để cấp") : ""}
                >{on ? "✓" : "·"}</span>
              );
            }} />
        ))}
      </Table>
    </Card>
  );
}
