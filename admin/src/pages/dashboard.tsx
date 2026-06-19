import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Typography, Tag, Empty, Space } from "antd";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ComposedChart, Line, PieChart, Pie, Cell,
} from "recharts";

const ana = { schema: "analytics" };
const ws = { schema: "workspace" };
const poll = { queryOptions: { refetchInterval: 30000 } };

const C = { navy: "#0F2A47", gold: "#C9A227", blue: "#2E75B6", green: "#3B7A57", red: "#C0392B", purple: "#6D28D9", teal: "#0F6E56", amber: "#B45309", slate: "#94a3b8" };
const STATUS_COLOR: Record<string, string> = { draft: C.slate, designing: C.blue, simulating: C.purple, experimenting: C.amber, live: C.green, archived: C.gold };
const STATUSES = ["draft", "designing", "simulating", "experimenting", "live", "archived"];
const PIE = [C.blue, C.gold, C.purple, C.teal, C.amber, C.navy, C.red];

const vnd = (n: number) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";
const num = (n: number) => (Number(n) || 0).toLocaleString("vi-VN");
const dshort = (s: string) => { try { return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }); } catch { return s; } };
function ago(s: string) {
  const d = (Date.now() - new Date(s).getTime()) / 1000;
  if (d < 60) return "vừa xong";
  if (d < 3600) return `${Math.floor(d / 60)} phút trước`;
  if (d < 86400) return `${Math.floor(d / 3600)} giờ trước`;
  return `${Math.floor(d / 86400)} ngày trước`;
}

type Row = Record<string, unknown>;

export function Dashboard() {
  const summary = (useList({ resource: "summary", meta: ana, pagination: { pageSize: 1 }, ...poll }).data?.data?.[0] ?? {}) as Row;
  const dv = (useList({ resource: "daily_ventures", meta: ana, pagination: { pageSize: 500 }, ...poll }).data?.data ?? []) as Row[];
  const cf = (useList({ resource: "daily_cashflow", meta: ana, pagination: { pageSize: 500 }, ...poll }).data?.data ?? []) as Row[];
  const cbm = (useList({ resource: "cost_by_model", meta: ana, pagination: { pageSize: 50 }, ...poll }).data?.data ?? []) as Row[];
  const ou = (useList({ resource: "org_usage", meta: ana, pagination: { pageSize: 100 }, ...poll }).data?.data ?? []) as Row[];

  const txns = (useList({ resource: "wallet_txns", meta: ws, pagination: { pageSize: 8 }, sorters: [{ field: "created_at", order: "desc" }], ...poll }).data?.data ?? []) as Row[];
  const vents = (useList({ resource: "ventures", meta: ws, pagination: { pageSize: 8 }, sorters: [{ field: "created_at", order: "desc" }], ...poll }).data?.data ?? []) as Row[];
  const usage = (useList({ resource: "usage_events", meta: ws, pagination: { pageSize: 8 }, sorters: [{ field: "created_at", order: "desc" }], ...poll }).data?.data ?? []) as Row[];

  // pivot ventures by date×status
  const vBydate = new Map<string, Row>();
  for (const r of dv) {
    const k = String(r.date);
    const row = vBydate.get(k) ?? { date: dshort(k) };
    row[String(r.status)] = Number(r.count) || 0;
    vBydate.set(k, row);
  }
  const ventureSeries = [...vBydate.values()];

  // cashflow + running balance
  let bal = 0;
  const cashSeries = cf.map((r) => {
    bal += (Number(r.topup_vnd) || 0) - (Number(r.debit_vnd) || 0);
    return { date: dshort(String(r.date)), topup: Number(r.topup_vnd) || 0, debit: Number(r.debit_vnd) || 0, balance: bal };
  });

  const costData = cbm.filter((r) => Number(r.cost_vnd) > 0).map((r) => ({ name: String(r.model), value: Number(r.cost_vnd) }));
  const topOrgs = ou.filter((r) => Number(r.spent_30d) > 0).slice(0, 10).map((r) => ({ name: String(r.name).slice(0, 20), spent: Number(r.spent_30d) }));

  const feed = [
    ...vents.map((v) => ({ t: String(v.created_at), icon: "🚀", color: C.blue, text: `Venture mới: ${v.name}` })),
    ...txns.map((x) => ({ t: String(x.created_at), icon: Number(x.amount_vnd) > 0 ? "💰" : "🔻", color: Number(x.amount_vnd) > 0 ? C.green : C.red, text: `${x.kind === "topup" ? "Nạp" : x.kind} ${vnd(Number(x.amount_vnd))}` })),
    ...usage.map((u) => ({ t: String(u.created_at), icon: "⚡", color: C.purple, text: `Usage ${u.product} ${vnd(Number(u.cost_vnd))}` })),
  ].filter((e) => e.t && e.t !== "undefined").sort((a, b) => (a.t < b.t ? 1 : -1)).slice(0, 14);

  const margin = (Number(summary.topup_month) || 0) - (Number(summary.ai_cost_month) || 0);

  return (
    <div style={{ padding: 4 }}>
      <Space align="baseline" style={{ justifyContent: "space-between", width: "100%" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>Trung tâm điều khiển RAI OS</Typography.Title>
        <Tag color="green">● cập nhật mỗi 30s</Tag>
      </Space>

      {/* KPI row */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Doanh nghiệp" value={num(summary.ventures as number)} /><div style={{ fontSize: 12, color: C.green }}>▲ {num(summary.ventures_month as number)} trong tháng · {num(summary.ventures_live as number)} live</div></Card></Col>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Tổ chức" value={num(summary.orgs as number)} /><div style={{ fontSize: 12, color: C.slate }}>{num(summary.active_orgs_7d as number)} hoạt động 7 ngày</div></Card></Col>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Tổng credit" value={vnd(summary.total_credit as number)} valueStyle={{ color: C.navy }} /></Card></Col>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Nạp tháng này" value={vnd(summary.topup_month as number)} valueStyle={{ color: C.green }} /></Card></Col>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Chi phí AI (tháng)" value={vnd(summary.ai_cost_month as number)} valueStyle={{ color: C.red }} /><div style={{ fontSize: 12, color: margin >= 0 ? C.green : C.red }}>biên: {vnd(margin)}</div></Card></Col>
        <Col xs={12} md={8} lg={4}><Card size="small"><Statistic title="Thành viên" value={num(summary.members as number)} /><div style={{ fontSize: 12, color: C.slate }}>{num(summary.usage_events as number)} lượt usage</div></Card></Col>
      </Row>

      {/* charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Tăng trưởng Venture theo ngày" size="small">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ventureSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Legend />
                {STATUSES.map((s) => <Bar key={s} dataKey={s} stackId="v" fill={STATUS_COLOR[s]} name={s} />)}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Dòng tiền credit (VND)" size="small">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={cashSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v) => vnd(Number(v))} /><Legend />
                <Bar dataKey="topup" fill={C.green} name="Nạp" /><Bar dataKey="debit" fill={C.red} name="Trừ" />
                <Line type="monotone" dataKey="balance" stroke={C.navy} strokeWidth={2} dot={false} name="Số dư" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Chi phí AI theo mô hình" size="small">
            {costData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {costData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => vnd(Number(v))} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="Chưa có chi phí AI ghi nhận" style={{ padding: 40 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top tổ chức theo usage (30 ngày)" size="small">
            {topOrgs.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topOrgs} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><YAxis type="category" dataKey="name" width={110} fontSize={11} /><Tooltip formatter={(v) => vnd(Number(v))} />
                  <Bar dataKey="spent" fill={C.gold} name="Đã tiêu" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty description="Chưa có usage" style={{ padding: 40 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Hoạt động trực tiếp" size="small" styles={{ body: { maxHeight: 260, overflow: "auto" } }}>
            {feed.length ? feed.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0efe9" }}>
                <span>{e.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "#2C2C2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.text}</div>
                  <div style={{ fontSize: 11, color: C.slate }}>{ago(e.t)}</div>
                </div>
              </div>
            )) : <Empty description="Chưa có hoạt động" style={{ padding: 40 }} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
