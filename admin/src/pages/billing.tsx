import { useCallback, useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Tag, Typography, Alert, Select, InputNumber, Input, Button, Space, Popconfirm, App as AntdApp } from "antd";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { supabaseClient } from "../supabaseClient";

const MARKUP_API = "https://raiholdings.vn/api/admin/markup";

const ana = { schema: "analytics" };
const poll = { queryOptions: { refetchInterval: 30000 } };
const C = { navy: "#0F2A47", gold: "#C9A227", blue: "#2E75B6", green: "#3B7A57", red: "#C0392B", purple: "#6D28D9", slate: "#94a3b8" };
const PIE = [C.blue, C.gold, C.purple, C.green, C.red, C.navy];
const vnd = (n: number) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";
const dshort = (s: string) => { try { return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }); } catch { return s; } };
type Row = Record<string, unknown>;

export function Billing() {
  const summary = (useList({ resource: "summary", meta: ana, pagination: { pageSize: 1 }, ...poll }).data?.data?.[0] ?? {}) as Row;
  const rev = (useList({ resource: "daily_revenue", meta: ana, pagination: { pageSize: 60 }, ...poll }).data?.data ?? []) as Row[];
  const cbm = (useList({ resource: "cost_by_model", meta: ana, pagination: { pageSize: 50 }, ...poll }).data?.data ?? []) as Row[];
  const health = (useList({ resource: "org_wallet_health", meta: ana, pagination: { pageSize: 200 }, ...poll }).data?.data ?? []) as Row[];

  const revSeries = rev.map((r) => ({ date: dshort(String(r.date)), revenue: Number(r.revenue_vnd) || 0, cost: Number(r.ai_cost_vnd) || 0, margin: (Number(r.revenue_vnd) || 0) - (Number(r.ai_cost_vnd) || 0) }));
  const costData = cbm.filter((r) => Number(r.cost_vnd) > 0).map((r) => ({ name: String(r.model), value: Number(r.cost_vnd) }));
  const margin = (Number(summary.topup_month) || 0) - (Number(summary.ai_cost_month) || 0);
  const atRisk = health.filter((h) => h.days_to_empty != null && Number(h.days_to_empty) < 14).length;

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Kinh tế nền tảng</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Doanh thu credit (tháng)" value={vnd(summary.topup_month as number)} valueStyle={{ color: C.green }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Chi phí AI (tháng)" value={vnd(summary.ai_cost_month as number)} valueStyle={{ color: C.red }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Biên lợi nhuận (tháng)" value={vnd(margin)} valueStyle={{ color: margin >= 0 ? C.green : C.red }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Tổng credit đang giữ" value={vnd(summary.total_credit as number)} valueStyle={{ color: C.navy }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu vs Chi phí AI (30 ngày)" size="small">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={revSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v) => vnd(Number(v))} /><Legend />
                <Bar dataKey="revenue" fill={C.green} name="Doanh thu" /><Bar dataKey="cost" fill={C.red} name="Chi phí AI" />
                <Line type="monotone" dataKey="margin" stroke={C.navy} strokeWidth={2} dot={false} name="Biên" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Chi phí AI theo mô hình" size="small">
            {costData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart><Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{costData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip formatter={(v) => vnd(Number(v))} /></PieChart>
              </ResponsiveContainer>
            ) : <Typography.Text type="secondary">Chưa có chi phí AI ghi nhận.</Typography.Text>}
          </Card>
        </Col>
      </Row>

      <Card title="Sức khỏe ví tổ chức" size="small" style={{ marginTop: 16 }}>
        {atRisk > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`${atRisk} tổ chức sắp cạn ví (< 14 ngày).`} />}
        <Table dataSource={health} rowKey="org_id" pagination={false} size="small">
          <Table.Column dataIndex="name" title="Tổ chức" />
          <Table.Column dataIndex="balance_vnd" title="Số dư" render={(v: number) => <b>{vnd(v)}</b>} />
          <Table.Column dataIndex="spent_30d" title="Chi 30 ngày" render={(v: number) => vnd(v)} />
          <Table.Column dataIndex="burn_per_day" title="Burn/ngày" render={(v: number) => vnd(v)} />
          <Table.Column dataIndex="days_to_empty" title="Dự báo cạn ví" render={(v: number | null) => v == null ? <Tag>—</Tag> : <Tag color={v < 14 ? "red" : v < 30 ? "orange" : "green"}>{v} ngày</Tag>} />
        </Table>
      </Card>

      <MarkupCard />
    </div>
  );
}

type Markup = { id: string; scope: string; target: string | null; percent: number };

function MarkupCard() {
  const { message } = AntdApp.useApp();
  const [rows, setRows] = useState<Markup[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "off" | "err">("loading");
  const [scope, setScope] = useState("global");
  const [target, setTarget] = useState("");
  const [percent, setPercent] = useState<number>(20);
  const [busy, setBusy] = useState(false);

  const token = useCallback(async () => (await supabaseClient.auth.getSession()).data.session?.access_token, []);
  const load = useCallback(async () => {
    try {
      const res = await fetch(MARKUP_API, { headers: { authorization: `Bearer ${await token()}` } });
      if (res.status === 503) { setState("off"); return; }
      const j = await res.json();
      setRows(j.data ?? []);
      setState("ok");
    } catch { setState("err"); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    setBusy(true);
    try {
      const res = await fetch(MARKUP_API, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${await token()}` }, body: JSON.stringify({ scope, target: scope === "global" ? null : target.trim(), percent }) });
      if (!res.ok) throw new Error();
      message.success("Đã lưu markup"); setTarget(""); load();
    } catch { message.error("Không lưu được markup"); } finally { setBusy(false); }
  }
  async function del(id: string) {
    try { await fetch(`${MARKUP_API}?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { authorization: `Bearer ${await token()}` } }); load(); }
    catch { message.error("Không xoá được"); }
  }

  return (
    <Card title="Markup (giá bán = giá gốc × (1 + markup%))" size="small" style={{ marginTop: 16 }}>
      <Typography.Paragraph type="secondary">Ưu tiên: model → provider → global → mặc định gateway (20%). Cấu hình trong RAI LLMs gateway.</Typography.Paragraph>
      {state === "off" && <Alert type="warning" showIcon message="Chưa cấu hình gateway admin (RAI_LLMS_ADMIN_TOKEN)." />}
      {state === "err" && <Alert type="error" showIcon message="Không kết nối được gateway." />}
      {state === "ok" && (
        <>
          <Table dataSource={rows} rowKey="id" size="small" pagination={false} style={{ marginBottom: 12 }}>
            <Table.Column dataIndex="scope" title="Phạm vi" render={(v: string) => <Tag color={v === "global" ? "gold" : v === "provider" ? "blue" : "purple"}>{v}</Tag>} />
            <Table.Column dataIndex="target" title="Đối tượng" render={(v: string) => v || "—"} />
            <Table.Column dataIndex="percent" title="Markup" render={(v: number) => `${v}%`} />
            <Table.Column title="" render={(_, r: Markup) => <Popconfirm title="Xoá markup này?" onConfirm={() => del(r.id)}><Button size="small" danger>Xoá</Button></Popconfirm>} />
          </Table>
          <Space wrap>
            <Select value={scope} onChange={setScope} style={{ width: 130 }} options={[{ value: "global", label: "global" }, { value: "provider", label: "provider" }, { value: "model", label: "model" }]} />
            <Input placeholder={scope === "provider" ? "anthropic / openai…" : scope === "model" ? "anthropic/claude-opus-4.8" : "(không cần)"} value={target} onChange={(e) => setTarget(e.target.value)} disabled={scope === "global"} style={{ width: 240 }} />
            <InputNumber value={percent} onChange={(v) => setPercent(Number(v) || 0)} min={0} max={500} addonAfter="%" />
            <Button type="primary" loading={busy} onClick={add}>Lưu</Button>
          </Space>
        </>
      )}
    </Card>
  );
}
