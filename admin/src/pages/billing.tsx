import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Tag, Typography, Alert } from "antd";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";

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

      <Alert type="info" showIcon style={{ marginTop: 16 }} message="Markup theo model/provider (giá bán = giá gốc × (1+markup)) được cấu hình trong RAI LLMs gateway — sẽ tích hợp vào trang này ở bước sau." />
    </div>
  );
}
