import { useCallback, useEffect, useState } from "react";
import { Button, Card, Table, Tag, Space, Modal, Form, Input, Select, message, Popconfirm, Typography } from "antd";
import { supabaseClient } from "../supabaseClient";

const API = "https://raiholdings.vn/api/admin/users";
type User = { id: string; email: string; created_at: string; last_sign_in_at?: string; banned: boolean; role: string };
const ROLES = ["owner", "admin", "editor", "viewer"];
const roleColor: Record<string, string> = { owner: "gold", admin: "green", editor: "blue", viewer: "default" };

async function call(method: string, body?: unknown) {
  const { data } = await supabaseClient.auth.getSession();
  const res = await fetch(API, { method, headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token}` }, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
  return j;
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers((await call("GET")).users ?? []); }
    catch (e) { message.error(e instanceof Error ? e.message : "Lỗi tải"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    const v = await form.validateFields();
    try { await call("POST", v); message.success("Đã tạo user"); setOpen(false); form.resetFields(); load(); }
    catch (e) { message.error(e instanceof Error ? e.message : "Lỗi"); }
  }
  async function act(id: string, action: string, extra?: Record<string, unknown>) {
    try { await call("PATCH", { id, action, ...extra }); message.success("Đã cập nhật"); load(); }
    catch (e) { message.error(e instanceof Error ? e.message : "Lỗi"); }
  }
  function resetPw(id: string) {
    let pw = "";
    Modal.confirm({ title: "Đặt lại mật khẩu", content: <Input.Password placeholder="Mật khẩu mới (≥8 ký tự)" onChange={(e) => (pw = e.target.value)} />, onOk: () => act(id, "password", { password: pw }) });
  }

  return (
    <Card title="Người dùng & vai trò" extra={<Button type="primary" onClick={() => setOpen(true)}>+ Tạo user</Button>}>
      <Typography.Paragraph type="secondary">Tài khoản đăng nhập admin (Supabase GoTrue). Chỉ owner mới tạo/khoá/đổi vai trò.</Typography.Paragraph>
      <Table dataSource={users} rowKey="id" loading={loading} size="small">
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="role" title="Vai trò" render={(v: string, r: User) => (
          <Select size="small" value={v === "—" ? undefined : v} placeholder="—" style={{ width: 110 }} options={ROLES.map((x) => ({ value: x, label: x }))} onChange={(nv) => act(r.id, "role", { role: nv })} />
        )} />
        <Table.Column dataIndex="banned" title="Trạng thái" render={(v: boolean) => v ? <Tag color="red">đã khoá</Tag> : <Tag color="green">hoạt động</Tag>} />
        <Table.Column dataIndex="last_sign_in_at" title="Đăng nhập gần nhất" render={(v: string) => (v ? new Date(v).toLocaleString("vi-VN") : "—")} />
        <Table.Column title="Hành động" render={(_, r: User) => (
          <Space>
            <Button size="small" onClick={() => resetPw(r.id)}>Đặt lại MK</Button>
            {r.banned
              ? <Button size="small" onClick={() => act(r.id, "unban")}>Mở khoá</Button>
              : <Popconfirm title="Khoá user này?" onConfirm={() => act(r.id, "ban")}><Button size="small" danger>Khoá</Button></Popconfirm>}
          </Space>
        )} />
      </Table>

      <Modal open={open} title="Tạo user mới" onOk={create} onCancel={() => setOpen(false)} okText="Tạo">
        <Form form={form} layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, min: 8 }]}><Input.Password placeholder="≥ 8 ký tự" /></Form.Item>
          <Form.Item label="Vai trò" name="role" initialValue="viewer"><Select options={ROLES.filter((x) => x !== "owner").map((x) => ({ value: x, label: x }))} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
