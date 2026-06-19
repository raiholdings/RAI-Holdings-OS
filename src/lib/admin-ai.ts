// AI admin operator — SERVER ONLY. Verifies a Supabase admin JWT, then runs a
// tool-using agent (real LLM via the gateway) that can read and govern the live
// platform data through the service_role DB adapter.
//
// Tool protocol is JSON-over-text (provider-agnostic): the model replies with
// {"tool","args"} to act or {"final"} to answer. No native function-calling
// needed, so it works through the gateway's OpenAI-compatible endpoint.
import { createHmac, timingSafeEqual } from "node:crypto";
import { dbSelect, dbUpdate, dbRpc } from "@/lib/db";

/* ── auth: verify Supabase HS256 JWT + admin role ──────────────────────────── */
export type AdminClaims = { sub: string; user_role?: string; org_id?: string; exp?: number };

function b64urlToBuf(s: string) { return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"); }

export function verifyAdminJwt(token: string): AdminClaims | null {
  const secret = process.env.SUPABASE_JWT_SECRET || "";
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  const got = b64urlToBuf(parts[2]);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  let claims: AdminClaims;
  try { claims = JSON.parse(b64urlToBuf(parts[1]).toString()); } catch { return null; }
  if (claims.exp && Date.now() / 1000 > claims.exp) return null;
  if (claims.user_role !== "owner" && claims.user_role !== "admin") return null;
  return claims;
}

/* ── tools (run with service_role; admin is global, no org scoping) ─────────── */
type ToolResult = { ok: boolean; data?: unknown; error?: string };

async function tool_get_stats(): Promise<ToolResult> {
  const [ventures, orgs, members, usage] = await Promise.all([
    dbSelect("ventures", "select=id"),
    dbSelect<{ balance_vnd: number }>("orgs", "select=id,balance_vnd"),
    dbSelect("org_members", "select=org_id"),
    dbSelect("usage_events", "select=cost_vnd"),
  ]);
  const credit = (orgs as { balance_vnd: number }[]).reduce((s, o) => s + Number(o.balance_vnd || 0), 0);
  const usageCost = (usage as { cost_vnd: number }[]).reduce((s, u) => s + Number(u.cost_vnd || 0), 0);
  return { ok: true, data: { ventures: ventures.length, orgs: orgs.length, members: members.length, totalCreditVnd: credit, usageEvents: usage.length, usageCostVnd: usageCost } };
}

async function tool_search_ventures(a: { status?: string; q?: string; limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 20, 1), 100);
  let q = `select=id,name,sector,region,status,confidence,org_id,created_at&order=created_at.desc&limit=${lim}`;
  if (a.status) q += `&status=eq.${encodeURIComponent(a.status)}`;
  if (a.q) q += `&name=ilike.*${encodeURIComponent(a.q)}*`;
  return { ok: true, data: await dbSelect("ventures", q) };
}

async function tool_set_venture_status(a: { id?: string; status?: string }): Promise<ToolResult> {
  const valid = ["draft", "designing", "simulating", "experimenting", "live", "archived"];
  if (!a.id || !a.status || !valid.includes(a.status)) return { ok: false, error: "need id + valid status" };
  await dbUpdate("ventures", `id=eq.${encodeURIComponent(a.id)}`, { status: a.status, updated_at: new Date().toISOString() });
  return { ok: true, data: { id: a.id, status: a.status } };
}

async function tool_list_orgs(): Promise<ToolResult> {
  return { ok: true, data: await dbSelect("orgs", "select=id,name,balance_vnd&order=created_at.desc&limit=100") };
}

async function tool_adjust_credit(a: { orgId?: string; amountVnd?: number; note?: string }): Promise<ToolResult> {
  const amt = Math.trunc(Number(a.amountVnd) || 0);
  if (!a.orgId || amt === 0) return { ok: false, error: "need orgId + non-zero amountVnd" };
  if (Math.abs(amt) > 1_000_000_000) return { ok: false, error: "amount too large" };
  const bal = await dbRpc<number>("wallet_apply", { p_org: a.orgId, p_amount: amt, p_kind: "adjust", p_note: (a.note || "admin-ai adjust").slice(0, 120), p_by: "admin-ai" });
  return { ok: true, data: { orgId: a.orgId, newBalanceVnd: Number(bal) } };
}

async function tool_recent_usage(a: { limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 20, 1), 100);
  return { ok: true, data: await dbSelect("usage_events", `select=created_at,product,model,units,cost_vnd,org_id&order=created_at.desc&limit=${lim}`) };
}

/* ── Solutions (marketplace / code / apps / mcp) ───────────────────────────── */
async function tool_list_listings(a: { q?: string; limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 30, 1), 100);
  let q = `select=id,slug,name,type,status,featured,install_count,rating&order=install_count.desc&limit=${lim}`;
  if (a.q) q += `&name=ilike.*${encodeURIComponent(a.q)}*`;
  return { ok: true, data: await dbSelect("listings", q, "marketplace") };
}
async function tool_set_listing_status(a: { id?: string; status?: string; featured?: boolean }): Promise<ToolResult> {
  if (!a.id) return { ok: false, error: "need id" };
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (a.status) patch.status = a.status;
  if (typeof a.featured === "boolean") patch.featured = a.featured;
  await dbUpdate("listings", `id=eq.${encodeURIComponent(a.id)}`, patch, "marketplace");
  return { ok: true, data: { id: a.id, ...patch } };
}
async function tool_list_repos(a: { limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 30, 1), 100);
  return { ok: true, data: await dbSelect("repos", `select=id,owner,name,license_spdx,deploy_status&limit=${lim}`, "code") };
}
async function tool_list_apps(a: { limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 30, 1), 100);
  return { ok: true, data: await dbSelect("apps", `select=id,name,category,developer,community&limit=${lim}`, "apps") };
}
async function tool_list_mcp_servers(a: { limit?: number }): Promise<ToolResult> {
  const lim = Math.min(Math.max(Number(a.limit) || 30, 1), 100);
  return { ok: true, data: await dbSelect("servers", `select=id,name,namespace,status,source&limit=${lim}`, "mcp") };
}

const TOOLS: Record<string, (a: Record<string, unknown>) => Promise<ToolResult>> = {
  get_stats: () => tool_get_stats(),
  search_ventures: (a) => tool_search_ventures(a),
  set_venture_status: (a) => tool_set_venture_status(a),
  list_orgs: () => tool_list_orgs(),
  adjust_credit: (a) => tool_adjust_credit(a),
  recent_usage: (a) => tool_recent_usage(a),
  list_listings: (a) => tool_list_listings(a),
  set_listing_status: (a) => tool_set_listing_status(a),
  list_repos: (a) => tool_list_repos(a),
  list_apps: (a) => tool_list_apps(a),
  list_mcp_servers: (a) => tool_list_mcp_servers(a),
};

const SYSTEM = `Bạn là RAI OS Admin Operator — trợ lý quản trị nền tảng RAI Holdings OS, trả lời bằng tiếng Việt.
Bạn điều khiển hệ thống QUA CÔNG CỤ. Mỗi lượt, CHỈ trả về MỘT object JSON thuần (không markdown, không giải thích ngoài JSON):
- Để gọi công cụ: {"tool":"<tên>","args":{...}}
- Khi đã đủ thông tin để trả lời: {"final":"<câu trả lời cho quản trị viên>"}

Công cụ:
- get_stats: {} → số liệu tổng (ventures, orgs, members, tổng credit VND, usage).
- search_ventures: {status?, q?, limit?} → danh sách doanh nghiệp (status: draft|designing|simulating|experimenting|live|archived).
- set_venture_status: {id, status} → đổi trạng thái 1 venture.
- list_orgs: {} → danh sách tổ chức + số dư ví.
- adjust_credit: {orgId, amountVnd, note?} → cộng/trừ credit (amount âm để trừ). Chỉ làm khi quản trị viên YÊU CẦU RÕ.
- recent_usage: {limit?} → usage gần đây.
- list_listings: {q?, limit?} → sản phẩm Marketplace; set_listing_status: {id, status?, featured?} → duyệt/ẩn/đánh dấu nổi bật.
- list_repos: {limit?} → repo Code; list_apps: {limit?} → ứng dụng; list_mcp_servers: {limit?} → MCP servers.

Nguyên tắc: thao tác THAY ĐỔI dữ liệu (set_venture_status, adjust_credit) chỉ thực hiện khi người dùng yêu cầu rõ ràng; nếu mơ hồ, hỏi lại trong {"final"}. Không bịa số — luôn lấy từ công cụ. Số tiền hiển thị dạng VND.`;

function parseJson(text: string): { tool?: string; args?: Record<string, unknown>; final?: string } | null {
  const t = text.replace(/```(json)?/gi, "");
  // Extract the FIRST balanced {...} object (models sometimes append extra text/objects).
  const start = t.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { try { return JSON.parse(t.slice(start, i + 1)); } catch { return null; } } }
  }
  return null;
}

async function chat(messages: { role: string; content: string }[]): Promise<string> {
  const base = (process.env.RAI_LLMS_BASE || "").replace(/\/$/, "");
  const key = process.env.RAI_LLMS_API_KEY || "";
  if (!base || !key) throw new Error("gateway_not_configured");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.RAI_LLMS_MODEL || "anthropic/claude-opus-4.8", messages, max_tokens: 1024 }),
  });
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return j.choices?.[0]?.message?.content || "";
}

export type AdminAction = { tool: string; args: Record<string, unknown>; ok: boolean; error?: string };

/** Run the agent loop for one admin instruction. Returns the reply + actions taken. */
export async function runAdminAgent(userMessages: { role: string; content: string }[]): Promise<{ reply: string; actions: AdminAction[] }> {
  const msgs = [{ role: "system", content: SYSTEM }, ...userMessages];
  const actions: AdminAction[] = [];
  for (let i = 0; i < 6; i++) {
    const out = await chat(msgs);
    const parsed = parseJson(out);
    if (!parsed || typeof parsed.final === "string" || (!parsed.tool && parsed.final !== undefined)) {
      return { reply: parsed?.final ?? out, actions };
    }
    if (!parsed.tool) return { reply: out, actions };
    const fn = TOOLS[parsed.tool];
    const obs: ToolResult = fn ? await fn(parsed.args || {}).catch((e) => ({ ok: false, error: String(e).slice(0, 200) })) : { ok: false, error: "unknown tool" };
    actions.push({ tool: parsed.tool, args: parsed.args || {}, ok: obs.ok, error: obs.error });
    msgs.push({ role: "assistant", content: out });
    msgs.push({ role: "user", content: "OBSERVATION: " + JSON.stringify(obs).slice(0, 4000) });
  }
  return { reply: "Đã đạt giới hạn số bước xử lý. Hãy thử chia nhỏ yêu cầu.", actions };
}
