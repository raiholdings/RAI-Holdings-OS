import { useList } from "@refinedev/core";
import { Card, Table, Tag, Typography } from "antd";

const iam = { schema: "iam" };

export function PermissionMatrix() {
  const roles = (useList({ resource: "roles", meta: iam, pagination: { pageSize: 50 } }).data?.data ?? []) as { key: string; label: string }[];
  const perms = (useList({ resource: "permissions", meta: iam, pagination: { pageSize: 200 } }).data?.data ?? []) as { key: string; label: string }[];
  const rp = (useList({ resource: "role_permissions", meta: iam, pagination: { pageSize: 1000 } }).data?.data ?? []) as { role_key: string; permission_key: string }[];

  const has = new Set(rp.map((x) => `${x.role_key}:${x.permission_key}`));
  const data = perms.map((p) => ({ key: p.key, label: p.label }));

  return (
    <Card title="Ma trận phân quyền (Permissions × Roles)">
      <Typography.Paragraph type="secondary">Quyền dạng <code>module.resource.action</code>. Hiện đọc từ <code>iam.role_permissions</code>. (Chỉnh sửa ma trận sẽ bổ sung sau.)</Typography.Paragraph>
      <Table dataSource={data} rowKey="key" size="small" pagination={false} scroll={{ x: true }}>
        <Table.Column dataIndex="key" title="Quyền" fixed="left" render={(v: string, r: { label: string }) => (<div><div style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{r.label}</div></div>)} />
        {roles.map((role) => (
          <Table.Column key={role.key} title={<Tag color={role.key === "owner" ? "gold" : role.key === "admin" ? "green" : role.key === "editor" ? "blue" : "default"}>{role.key}</Tag>} align="center"
            render={(_, r: { key: string }) => (has.has(`${role.key}:${r.key}`) ? <span style={{ color: "#3B7A57" }}>✓</span> : <span style={{ color: "#e2e0d6" }}>·</span>)} />
        ))}
      </Table>
    </Card>
  );
}
