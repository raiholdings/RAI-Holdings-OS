import { List, useTable, EditButton, DeleteButton, ShowButton, Edit, useForm, Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Table, Space, Tag, Form, Select, Typography, Descriptions } from "antd";

const meta = { schema: "workspace" };

const STATUS = ["draft", "designing", "simulating", "experimenting", "live", "archived"];
const statusColor: Record<string, string> = {
  draft: "default", designing: "blue", simulating: "geekblue", experimenting: "purple", live: "green", archived: "gold",
};

export function VentureList() {
  const { tableProps } = useTable({ resource: "ventures", meta, sorters: { initial: [{ field: "created_at", order: "desc" }] } });
  return (
    <List title="Doanh nghiệp (Ventures)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên" />
        <Table.Column dataIndex="sector" title="Ngành" />
        <Table.Column dataIndex="region" title="Vùng" />
        <Table.Column dataIndex="confidence" title="Tin cậy" render={(v: number) => `${v ?? 0}%`} />
        <Table.Column dataIndex="status" title="Trạng thái" render={(v: string) => <Tag color={statusColor[v] ?? "default"}>{v}</Tag>} />
        <Table.Column dataIndex="org_id" title="Tổ chức" ellipsis />
        <Table.Column dataIndex="created_at" title="Tạo lúc" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
        <Table.Column
          title="Hành động" dataIndex="actions"
          render={(_, r: { id: string }) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={r.id} />
              <EditButton hideText size="small" recordItemId={r.id} />
              <DeleteButton hideText size="small" recordItemId={r.id} meta={meta} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}

export function VentureEdit() {
  const { formProps, saveButtonProps } = useForm({ resource: "ventures", meta, action: "edit" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select options={STATUS.map((s) => ({ value: s, label: s }))} />
        </Form.Item>
        <Typography.Paragraph type="secondary">
          Chỉ sửa trạng thái ở đây. Nội dung chi tiết (market signals, blueprint…) do pipeline AI tạo.
        </Typography.Paragraph>
      </Form>
    </Edit>
  );
}

export function VentureShow() {
  const { queryResult } = useShow({ resource: "ventures", meta });
  const r = queryResult?.data?.data as Record<string, unknown> | undefined;
  const data = (r?.data ?? {}) as Record<string, unknown>;
  return (
    <Show>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Tên">{String(r?.name ?? "—")}</Descriptions.Item>
        <Descriptions.Item label="Ngành">{String(r?.sector ?? "—")}</Descriptions.Item>
        <Descriptions.Item label="Vùng">{String(r?.region ?? "—")}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{String(r?.status ?? "—")}</Descriptions.Item>
        <Descriptions.Item label="Độ tin cậy">{String(r?.confidence ?? 0)}%</Descriptions.Item>
        <Descriptions.Item label="Ý tưởng gốc">{String(data?.ideaPrompt ?? r?.idea_prompt ?? "—")}</Descriptions.Item>
        <Descriptions.Item label="Org">{String(r?.org_id ?? "—")}</Descriptions.Item>
      </Descriptions>
      <Typography.Paragraph style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">JSON đầy đủ:</Typography.Text>
      </Typography.Paragraph>
      <pre style={{ background: "#faf9f5", padding: 12, borderRadius: 6, overflow: "auto", fontSize: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Show>
  );
}
