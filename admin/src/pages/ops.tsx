import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Card, Col, Row, Table, Tag, Typography, Badge } from "antd";

const ops = { schema: "ops" };
const ENDPOINTS = [
  { name: "Trang chủ", url: "https://raiholdings.vn" },
  { name: "Supabase API", url: "https://api.raiholdings.vn/rest/v1/" },
  { name: "RAI LLMs gateway", url: "https://llms.raiholdings.vn/health" },
  { name: "Admin", url: "https://admin.raiholdings.vn" },
  { name: "Studio (đã khoá)", url: "https://studio.raiholdings.vn" },
];
const mb = (n: number) => (Number(n) / 1024 / 1024).toFixed(2) + " MB";

type Stat = { name: string; up: boolean | null; ms: number };

export function Ops() {
  const [stats, setStats] = useState<Stat[]>(ENDPOINTS.map((e) => ({ name: e.name, up: null, ms: 0 })));

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      const out = await Promise.all(ENDPOINTS.map(async (e) => {
        const t0 = performance.now();
        try { await fetch(e.url, { mode: "no-cors", cache: "no-store" }); return { name: e.name, up: true, ms: Math.round(performance.now() - t0) }; }
        catch { return { name: e.name, up: false, ms: Math.round(performance.now() - t0) }; }
      }));
      if (alive) setStats(out);
    };
    ping(); const id = setInterval(ping, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const backups = (useList({ resource: "backups", meta: ops, pagination: { pageSize: 30 }, sorters: [{ field: "created_at", order: "desc" }], queryOptions: { refetchInterval: 60000 } }).data?.data ?? []) as Record<string, unknown>[];

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Vận hành & độ tin cậy</Typography.Title>

      <Card title="Trạng thái hệ thống" size="small">
        <Row gutter={[16, 16]}>
          {stats.map((s) => (
            <Col xs={12} md={8} lg={4} key={s.name}>
              <Card size="small">
                <Badge status={s.up == null ? "processing" : s.up ? "success" : "error"} text={s.name} />
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.up == null ? "đang kiểm tra…" : s.up ? `${s.ms}ms` : "không truy cập được"}</div>
              </Card>
            </Col>
          ))}
        </Row>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>Kiểm tra khả năng truy cập (no-cors) mỗi 30s. Studio yêu cầu basic-auth (khoá).</Typography.Paragraph>
      </Card>

      <Card title="Sao lưu cơ sở dữ liệu (pg_dump hằng đêm 02:00)" size="small" style={{ marginTop: 16 }}>
        <Table dataSource={backups} rowKey="id" size="small" pagination={{ pageSize: 10 }}>
          <Table.Column dataIndex="created_at" title="Thời gian" render={(v: string) => (v ? new Date(v).toLocaleString("vi-VN") : "—")} />
          <Table.Column dataIndex="filename" title="Tệp" />
          <Table.Column dataIndex="size_bytes" title="Dung lượng" render={(v: number) => mb(v)} />
          <Table.Column dataIndex="ok" title="Kết quả" render={(v: boolean) => (v ? <Tag color="green">OK</Tag> : <Tag color="red">Lỗi</Tag>)} />
        </Table>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>Lưu tại /opt/rai/backups trên VM (giữ 14 bản gần nhất).</Typography.Paragraph>
      </Card>
    </div>
  );
}
