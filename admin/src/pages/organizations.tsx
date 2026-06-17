import { List, useTable, EditButton, DeleteButton, Create, Edit, useForm } from "@refinedev/antd";
import { Table, Space, Form, Input } from "antd";

const meta = { schema: "iam" };

export function OrgList() {
  const { tableProps } = useTable({ resource: "organizations", meta, syncWithLocation: true });
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên tổ chức" />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column dataIndex="created_at" title="Tạo lúc" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: { id: string }) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} meta={meta} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}

export function OrgCreate() {
  const { formProps, saveButtonProps } = useForm({ resource: "organizations", meta, action: "create" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Tên tổ chức" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}><Input placeholder="rai-holdings" /></Form.Item>
      </Form>
    </Create>
  );
}

export function OrgEdit() {
  const { formProps, saveButtonProps } = useForm({ resource: "organizations", meta, action: "edit" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Tên tổ chức" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}><Input /></Form.Item>
      </Form>
    </Edit>
  );
}
