import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Tag, Typography, Empty } from "antd";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const ana = { schema: "analytics" };
const ws = { schema: "workspace" };
const poll = { queryOptions: { refetchInterval: 30000 } };
const C = { green: "#3B7A57", red: "#C0392B", blue: "#2E75B6", gold: "#C9A227", slate: "#94a3b8", navy: "#0F2A47" };
type Row = Record<string, unknown>;

export function Observability() {
  const succ = (useList({ resource: "agent_success", meta: ana, pagination: { pageSize: 50 }, ...poll }).data?.data ?? []) as Row[];
  const runs = (useList({ resource: "agent_runs", meta: ws, pagination: { pageSize: 20 }, sorters: [{ field: "created_at", order: "desc" }], ...poll }).data?.data ?? []) as Row[];

  const total = succ.reduce((s, r) => s + Number(r.total || 0), 0);
  const done = succ.reduce((s, r) => s + Number(r.done || 0), 0);
  const failed = total - done;
  const rate = total ? Math.round((done / total) * 100) : 0;
  const avgLatency = succ.length ? Math.round(succ.reduce((s, r) => s + Number(r.avg_latency_ms || 0) * Number(r.total || 0), 0) / (total || 1)) : 0;
  const chart = succ.map((r) => ({ engine: String(r.engine), done: Number(r.done || 0), failed: Number(r.failed || 0), latency: Number(r.avg_latency_ms || 0) }));

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Observability AI</Typography.Title>
      <Typography.Paragraph type="secondary">Theo dõi các lượt chạy engine của Venture Builder (qua RAI LLMs gateway). Cập nhật 30s.</Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Tổng lượt chạy" value={total} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Tỷ lệ thành công" value={rate} suffix="%" valueStyle={{ color: rate >= 90 ? C.green : rate >= 70 ? C.gold : C.red }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Lỗi" value={failed} valueStyle={{ color: failed ? C.red : undefined }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Độ trễ TB" value={avgLatency} suffix="ms" /></Card></Col>
      </Row>

      <Card title="Theo engine (8 bước Venture Builder)" size="small" style={{ marginTop: 16 }}>
        {chart.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="engine" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Legend />
              <Bar dataKey="done" stackId="r" fill={C.green} name="Thành công" />
              <Bar dataKey="failed" stackId="r" fill={C.red} name="Lỗi" />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty description="Chưa có lượt chạy engine nào. Tạo một Venture để sinh dữ liệu." style={{ padding: 40 }} />}
      </Card>

      <Card title="Lượt chạy gần đây" size="small" style={{ marginTop: 16 }}>
        <Table dataSource={runs} rowKey="id" size="small" pagination={{ pageSize: 10 }}>
          <Table.Column dataIndex="created_at" title="Thời gian" render={(v: string) => (v ? new Date(v).toLocaleString("vi-VN") : "—")} />
          <Table.Column dataIndex="engine" title="Engine" render={(v: string) => <Tag>{v}</Tag>} />
          <Table.Column dataIndex="source" title="Nguồn" render={(v: string) => <Tag color={v === "gateway" || v === "llm" ? "green" : v === "mock" ? "default" : "blue"}>{v || "—"}</Tag>} />
          <Table.Column dataIndex="ok" title="Kết quả" render={(v: boolean) => (v ? <Tag color="green">OK</Tag> : <Tag color="red">Lỗi</Tag>)} />
          <Table.Column dataIndex="latency_ms" title="Độ trễ" render={(v: number) => `${v} ms`} />
        </Table>
      </Card>
    </div>
  );
}
