import { useRef, useState } from "react";
import { Button, Card, Input, Space, Tag, Typography, Alert, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import { supabaseClient } from "../supabaseClient";

const API = "https://raiholdings.vn/api/admin/ai";
type Pending = { tool: string; args: Record<string, unknown>; summary: string };
type Msg = { role: "user" | "assistant"; content: string; actions?: { tool: string; ok: boolean }[]; pending?: Pending };

const SUGGESTIONS = [
  "Có bao nhiêu doanh nghiệp và tổng credit?",
  "Liệt kê 10 venture mới nhất",
  "Liệt kê tổ chức và số dư ví",
  "Sản phẩm marketplace nổi bật",
];

async function token() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.access_token;
}

export function AiConsole() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const lastUser = useRef("");
  const endRef = useRef<HTMLDivElement>(null);
  const scroll = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setErr(null);
    lastUser.current = q;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const t = await token();
      if (!t) throw new Error("Chưa đăng nhập.");
      const res = await fetch(API, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${t}` }, body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setMsgs((m) => [...m, { role: "assistant", content: j.reply || "(trống)", actions: j.actions, pending: j.pending }]);
    } catch (e) { setErr(e instanceof Error ? e.message : "Lỗi"); }
    finally { setBusy(false); scroll(); }
  }

  async function confirm(p: Pending) {
    setBusy(true); setErr(null);
    try {
      const t = await token();
      const res = await fetch(API, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${t}` }, body: JSON.stringify({ confirm: { tool: p.tool, args: p.args }, prompt: lastUser.current }) });
      const j = await res.json();
      // clear the pending flag on the message + append the result
      setMsgs((m) => m.map((x) => (x.pending === p ? { ...x, pending: undefined } : x)).concat({ role: "assistant", content: j.reply || (j.ok ? "✅ Đã thực hiện." : "❌ Lỗi") }));
    } catch (e) { setErr(e instanceof Error ? e.message : "Lỗi"); }
    finally { setBusy(false); scroll(); }
  }

  function cancel(p: Pending) {
    setMsgs((m) => m.map((x) => (x.pending === p ? { ...x, pending: undefined, content: x.content + "\n\n(Đã huỷ)" } : x)));
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <Space align="baseline" style={{ justifyContent: "space-between", width: "100%" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>AI điều khiển quản trị</Typography.Title>
        <Link to="/ai/history">Lịch sử thao tác →</Link>
      </Space>
      <Typography.Paragraph type="secondary">
        Ra lệnh tiếng Việt — AI truy vấn dữ liệu sống và thực hiện hành động. Thao tác THAY ĐỔI (đổi trạng thái, điều chỉnh credit) yêu cầu bạn <b>xác nhận</b> trước khi chạy, và được ghi vào nhật ký kiểm toán.
      </Typography.Paragraph>

      {msgs.length === 0 && <Space wrap style={{ marginBottom: 12 }}>{SUGGESTIONS.map((s) => <Button key={s} size="small" onClick={() => send(s)}>{s}</Button>)}</Space>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <Card key={i} size="small" style={{ background: m.role === "user" ? "#f4f3ee" : "#fff", borderColor: m.pending ? "#C9A227" : m.role === "assistant" ? "#e8e6dd" : undefined }}>
            <Typography.Text strong>{m.role === "user" ? "Bạn" : "RAI Admin AI"}</Typography.Text>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{m.content}</div>
            {m.actions && m.actions.length > 0 && <div style={{ marginTop: 8 }}>{m.actions.map((a, k) => <Tag key={k} color={a.ok ? "green" : "red"}>{a.tool}</Tag>)}</div>}
            {m.pending && (
              <div style={{ marginTop: 10, padding: 10, background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 6 }}>
                <div style={{ marginBottom: 8 }}>⚠️ <b>Cần xác nhận:</b> {m.pending.summary}</div>
                <Space>
                  <Popconfirm title="Thực hiện hành động này?" onConfirm={() => confirm(m.pending!)} okText="Chạy" cancelText="Không">
                    <Button type="primary" size="small" loading={busy}>Xác nhận</Button>
                  </Popconfirm>
                  <Button size="small" onClick={() => cancel(m.pending!)}>Huỷ</Button>
                </Space>
              </div>
            )}
          </Card>
        ))}
        <div ref={endRef} />
      </div>

      {err && <Alert type="error" message={err} style={{ marginBottom: 12 }} showIcon />}

      <Space.Compact style={{ width: "100%" }}>
        <Input.TextArea value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ví dụ: đổi venture v-1 sang live; hoặc cộng 500.000đ vào org-99" autoSize={{ minRows: 2, maxRows: 5 }} />
        <Button type="primary" loading={busy} onClick={() => send(input)} style={{ height: "auto" }}>Gửi</Button>
      </Space.Compact>
    </div>
  );
}
