import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";

const ws = { schema: "workspace" };
const vnd = (n: number) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

function useCount(resource: string, schema = "workspace") {
  const { data } = useList({ resource, meta: { schema }, pagination: { pageSize: 1 }, queryOptions: { keepPreviousData: true } });
  return data?.total ?? 0;
}

export function Dashboard() {
  const ventures = useCount("ventures");
  const orgs = useCount("orgs");
  const members = useCount("org_members");
  const usageCount = useCount("usage_events");

  const { data: orgRows } = useList({ resource: "orgs", meta: ws, pagination: { pageSize: 1000 } });
  const totalCredit = (orgRows?.data ?? []).reduce((s, o: Record<string, unknown>) => s + (Number(o.balance_vnd) || 0), 0);

  const { data: recentTxns } = useList({ resource: "wallet_txns", meta: ws, pagination: { pageSize: 8 }, sorters: [{ field: "created_at", order: "desc" }] });
  const { data: recentUsage } = useList({ resource: "usage_events", meta: ws, pagination: { pageSize: 8 }, sorters: [{ field: "created_at", order: "desc" }] });

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Tổng quan RAI OS</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><Card><Statistic title="Doanh nghiệp (Ventures)" value={ventures} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Tổ chức" value={orgs} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Thành viên" value={members} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Tổng credit" value={vnd(totalCredit)} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Giao dịch gần đây">
            <Table dataSource={recentTxns?.data ?? []} rowKey="id" pagination={false} size="small">
              <Table.Column dataIndex="created_at" title="Lúc" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
              <Table.Column dataIndex="kind" title="Loại" render={(v: string) => <Tag color={v === "topup" ? "green" : v === "debit" ? "red" : "default"}>{v}</Tag>} />
              <Table.Column dataIndex="amount_vnd" title="Số tiền" render={(v: number) => (v > 0 ? `+${vnd(v)}` : vnd(v))} />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={`Sử dụng gần đây (tổng ${usageCount})`}>
            <Table dataSource={recentUsage?.data ?? []} rowKey="id" pagination={false} size="small">
              <Table.Column dataIndex="created_at" title="Lúc" render={(v: string) => (v ? new Date(v).toLocaleString() : "—")} />
              <Table.Column dataIndex="product" title="Sản phẩm" render={(v: string) => <Tag color="blue">{v}</Tag>} />
              <Table.Column dataIndex="cost_vnd" title="Chi phí" render={(v: number) => vnd(v)} />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
