import { List, useTable, EditButton, Edit, useForm } from "@refinedev/antd";
import { Table, Tag, Form, Select, Switch } from "antd";

/* ── Marketplace listings (schema: marketplace) ──────────────────────────── */
const mkt = { schema: "marketplace" };
export function ListingList() {
  const { tableProps } = useTable({ resource: "listings", meta: mkt, sorters: { initial: [{ field: "install_count", order: "desc" }] } });
  return (
    <List title="Marketplace — Sản phẩm">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên" />
        <Table.Column dataIndex="type" title="Loại" render={(v: string) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="status" title="Trạng thái" render={(v: string) => <Tag color={v === "approved" || v === "published" ? "green" : v === "submitted" ? "blue" : "default"}>{v}</Tag>} />
        <Table.Column dataIndex="featured" title="Nổi bật" render={(v: boolean) => (v ? <Tag color="gold">★</Tag> : "—")} />
        <Table.Column dataIndex="install_count" title="Lượt cài" />
        <Table.Column dataIndex="rating" title="Đánh giá" />
        <Table.Column dataIndex="publisher_id" title="Nhà cung cấp" ellipsis />
        <Table.Column title="" dataIndex="actions" render={(_, r: { id: string }) => <EditButton hideText size="small" recordItemId={r.id} />} />
      </Table>
    </List>
  );
}
export function ListingEdit() {
  const { formProps, saveButtonProps } = useForm({ resource: "listings", meta: mkt, action: "edit" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Trạng thái" name="status">
          <Select options={["draft", "submitted", "approved", "published", "suspended", "rejected"].map((s) => ({ value: s, label: s }))} />
        </Form.Item>
        <Form.Item label="Nổi bật" name="featured" valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Edit>
  );
}

/* ── Code repos (schema: code) ───────────────────────────────────────────── */
export function RepoList() {
  const { tableProps } = useTable({ resource: "repos", meta: { schema: "code" } });
  return (
    <List title="Code — Repositories">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="slug" title="Repo" />
        <Table.Column dataIndex="license_spdx" title="Giấy phép" render={(v: string) => <Tag color="blue">{v}</Tag>} />
        <Table.Column dataIndex="deploy_status" title="Deploy" render={(v: string) => <Tag color={v === "live" ? "green" : "default"}>{v}</Tag>} />
        <Table.Column dataIndex="owner" title="Chủ sở hữu" />
      </Table>
    </List>
  );
}

/* ── Apps (schema: apps) ─────────────────────────────────────────────────── */
export function AppList() {
  const { tableProps } = useTable({ resource: "apps", meta: { schema: "apps" } });
  return (
    <List title="Apps — Ứng dụng AI">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên" />
        <Table.Column dataIndex="category" title="Danh mục" render={(v: string) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="developer" title="Nhà phát triển" />
        <Table.Column dataIndex="community" title="Cộng đồng" render={(v: boolean) => (v ? <Tag color="purple">community</Tag> : <Tag color="gold">RAI</Tag>)} />
      </Table>
    </List>
  );
}

/* ── MCP servers (schema: mcp) ───────────────────────────────────────────── */
export function McpServerList() {
  const { tableProps } = useTable({ resource: "servers", meta: { schema: "mcp" } });
  return (
    <List title="MCP — Registry">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Server" />
        <Table.Column dataIndex="namespace" title="Namespace" render={(v: string) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="status" title="Trạng thái" render={(v: string) => <Tag color={v === "active" ? "green" : "default"}>{v}</Tag>} />
        <Table.Column dataIndex="source" title="Nguồn" render={(v: string) => <Tag color={v === "rai" ? "gold" : "blue"}>{v}</Tag>} />
      </Table>
    </List>
  );
}
