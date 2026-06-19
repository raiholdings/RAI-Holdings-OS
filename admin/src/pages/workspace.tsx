import { List, useTable, EditButton, Edit, useForm } from "@refinedev/antd";
import { Table, Tag, Form, InputNumber, Input } from "antd";

const meta = { schema: "workspace" };
const vnd = (n: number) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

/* ── workspace.orgs (wallet balance) ─────────────────────────────────────── */
export function WsOrgList() {
  const { tableProps } = useTable({ resource: "orgs", meta, sorters: { initial: [{ field: "created_at", order: "desc" }] } });
  return (
    <List title="Tổ chức workspace (ví credit)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên" />
        <Table.Column dataIndex="balance_vnd" title="Số dư" render={(v: number) => <b>{vnd(v)}</b>} />
        <Table.Column dataIndex="id" title="ID" ellipsis />
        <Table.Column dataIndex="created_at" title="Tạo lúc" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
        <Table.Column title="Hành động" dataIndex="actions" render={(_, r: { id: string }) => <EditButton hideText size="small" recordItemId={r.id} />} />
      </Table>
    </List>
  );
}

export function WsOrgEdit() {
  const { formProps, saveButtonProps } = useForm({ resource: "orgs", meta, action: "edit" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Tên" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Số dư (VND)" name="balance_vnd" rules={[{ required: true }]}>
          <InputNumber style={{ width: 240 }} min={0} step={100000} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} />
        </Form.Item>
      </Form>
    </Edit>
  );
}

/* ── workspace.org_members ────────────────────────────────────────────────── */
export function WsMemberList() {
  const { tableProps } = useTable({ resource: "org_members", meta });
  return (
    <List title="Thành viên workspace">
      <Table {...tableProps} rowKey={(r) => `${(r as { org_id?: string }).org_id}:${(r as { rai_user_id?: string }).rai_user_id}`}>
        <Table.Column dataIndex="name" title="Tên" />
        <Table.Column dataIndex="username" title="Username" render={(v: string) => (v ? `@${v}` : "—")} />
        <Table.Column dataIndex="role" title="Vai trò" render={(v: string) => <Tag color="gold">{v}</Tag>} />
        <Table.Column dataIndex="org_id" title="Org" ellipsis />
        <Table.Column dataIndex="created_at" title="Tham gia" render={(v: string) => (v ? new Date(v).toLocaleDateString() : "—")} />
      </Table>
    </List>
  );
}

/* ── workspace.wallet_txns (ledger) ──────────────────────────────────────── */
export function TxnList() {
  const { tableProps } = useTable({ resource: "wallet_txns", meta, sorters: { initial: [{ field: "created_at", order: "desc" }] } });
  return (
    <List title="Giao dịch ví (Wallet ledger)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="created_at" title="Thời gian" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
        <Table.Column dataIndex="kind" title="Loại" render={(v: string) => <Tag color={v === "topup" || v === "refund" ? "green" : v === "debit" ? "red" : "default"}>{v}</Tag>} />
        <Table.Column dataIndex="amount_vnd" title="Số tiền" render={(v: number) => (v > 0 ? `+${vnd(v)}` : vnd(v))} />
        <Table.Column dataIndex="balance_after" title="Số dư sau" render={(v: number) => vnd(v)} />
        <Table.Column dataIndex="note" title="Ghi chú" />
        <Table.Column dataIndex="org_id" title="Org" ellipsis />
      </Table>
    </List>
  );
}

/* ── workspace.usage_events ──────────────────────────────────────────────── */
export function UsageList() {
  const { tableProps } = useTable({ resource: "usage_events", meta, sorters: { initial: [{ field: "created_at", order: "desc" }] } });
  return (
    <List title="Sử dụng (Usage)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="created_at" title="Thời gian" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
        <Table.Column dataIndex="product" title="Sản phẩm" render={(v: string) => <Tag color="blue">{v}</Tag>} />
        <Table.Column dataIndex="model" title="Model" />
        <Table.Column dataIndex="units" title="Lượt" />
        <Table.Column dataIndex="cost_vnd" title="Chi phí" render={(v: number) => vnd(v)} />
        <Table.Column dataIndex="org_id" title="Org" ellipsis />
      </Table>
    </List>
  );
}
