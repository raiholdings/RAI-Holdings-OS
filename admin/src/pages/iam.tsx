import { List, useTable } from "@refinedev/antd";
import { Table, Tag } from "antd";

const meta = { schema: "iam" };

export function RoleList() {
  const { tableProps } = useTable({ resource: "roles", meta });
  return (
    <List title="Vai trò (Roles)">
      <Table {...tableProps} rowKey="key">
        <Table.Column dataIndex="key" title="Key" render={(v: string) => <Tag color="blue">{v}</Tag>} />
        <Table.Column dataIndex="label" title="Tên" />
      </Table>
    </List>
  );
}

export function MembershipList() {
  const { tableProps } = useTable({ resource: "memberships", meta });
  return (
    <List title="Thành viên (Memberships)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="user_id" title="User ID" ellipsis />
        <Table.Column dataIndex="org_id" title="Org ID" ellipsis />
        <Table.Column dataIndex="role_key" title="Vai trò" render={(v: string) => <Tag color="gold">{v}</Tag>} />
        <Table.Column dataIndex="created_at" title="Tham gia" render={(v: string) => (v ? new Date(v).toLocaleDateString() : "—")} />
      </Table>
    </List>
  );
}
