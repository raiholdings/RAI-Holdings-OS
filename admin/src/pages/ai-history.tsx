import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Typography } from "antd";

const meta = { schema: "audit" };

export function AuditHistory() {
  const { tableProps } = useTable({ resource: "events", meta, sorters: { initial: [{ field: "created_at", order: "desc" }] } });
  return (
    <List title="Nhật ký kiểm toán (Audit log)">
      <Table {...tableProps} rowKey="id" expandable={{ expandedRowRender: (r: { prompt?: string; after_json?: unknown }) => (
        <div style={{ fontSize: 12 }}>
          {r.prompt && <div><b>Prompt:</b> {r.prompt}</div>}
          <pre style={{ background: "#faf9f5", padding: 8, borderRadius: 4, marginTop: 6, overflow: "auto" }}>{JSON.stringify(r.after_json ?? {}, null, 2)}</pre>
        </div>
      ) }}>
        <Table.Column dataIndex="created_at" title="Thời gian" render={(v: string) => (v ? new Date(v).toLocaleString("vi-VN") : "—")} />
        <Table.Column dataIndex="source" title="Nguồn" render={(v: string) => <Tag color={v === "ai" ? "purple" : "blue"}>{v}</Tag>} />
        <Table.Column dataIndex="action" title="Hành động" render={(v: string) => <Tag color="gold">{v}</Tag>} />
        <Table.Column dataIndex="target_table" title="Bảng" />
        <Table.Column dataIndex="target_id" title="Đối tượng" ellipsis />
        <Table.Column dataIndex="actor_role" title="Vai trò" />
        <Table.Column dataIndex="prompt" title="Lệnh" ellipsis render={(v: string) => <Typography.Text type="secondary" style={{ fontSize: 12 }}>{v || "—"}</Typography.Text>} />
      </Table>
    </List>
  );
}
