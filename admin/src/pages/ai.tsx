import { useRef, useState } from "react";
import { Button, Card, Input, Space, Tag, Typography, Alert } from "antd";
import { supabaseClient } from "../supabaseClient";

const API = "https://raiholdings.vn/api/admin/ai";
type Msg = { role: "user" | "assistant"; content: string; actions?: { tool: string; ok: boolean }[] };

const SUGGESTIONS = [
  "Có bao nhiêu doanh nghiệp và tổng credit là bao nhiêu?",
  "Liệt kê 10 venture mới nhất",
  "Liệt kê các tổ chức và số dư ví",
  "Usage gần đây thế nào?",
];

export function AiConsole() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setErr(null);
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await supabaseClient.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Chưa đăng nhập.");
      const res = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setMsgs((m) => [...m, { role: "assistant", content: j.reply || "(trống)", actions: j.actions }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>AI điều khiển quản trị</Typography.Title>
      <Typography.Paragraph type="secondary">
        Ra lệnh bằng tiếng Việt — AI thật (qua RAI LLMs gateway) truy vấn và thực hiện hành động quản trị trên dữ liệu sống.
        Thao tác thay đổi (đổi trạng thái venture, điều chỉnh credit) chỉ chạy khi bạn yêu cầu rõ.
      </Typography.Paragraph>

      {msgs.length === 0 && (
        <Space wrap style={{ marginBottom: 12 }}>
          {SUGGESTIONS.map((s) => <Button key={s} size="small" onClick={() => send(s)}>{s}</Button>)}
        </Space>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <Card key={i} size="small" style={{ background: m.role === "user" ? "#f4f3ee" : "#fff", borderColor: m.role === "assistant" ? "#C9A227" : undefined }}>
            <Typography.Text strong>{m.role === "user" ? "Bạn" : "RAI Admin AI"}</Typography.Text>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{m.content}</div>
            {m.actions && m.actions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {m.actions.map((a, k) => <Tag key={k} color={a.ok ? "green" : "red"}>{a.tool}</Tag>)}
              </div>
            )}
          </Card>
        ))}
        <div ref={endRef} />
      </div>

      {err && <Alert type="error" message={err} style={{ marginBottom: 12 }} showIcon />}

      <Space.Compact style={{ width: "100%" }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ví dụ: đổi venture X sang trạng thái live; hoặc cộng 500.000đ vào org-99"
          autoSize={{ minRows: 2, maxRows: 5 }}
        />
        <Button type="primary" loading={busy} onClick={() => send(input)} style={{ height: "auto" }}>Gửi</Button>
      </Space.Compact>
    </div>
  );
}
