/**
 * RAI Apps — registry for the /apps directory (MCP Apps Extension, SEP-1865).
 * Each "app" = an MCP server that registers a ui:// resource + tools.
 * Here the registry is static (registry.json equivalent); swap for an API later.
 * Bilingual EN/VI. Locked vocab: "ứng dụng"=app, "kết nối"=connect,
 * "trợ lý ảo"=AI agent, "đợt làm việc"=sprint.
 */
import { t, type T } from "@/lib/i18n-core";

export type AppCategory = "property" | "design" | "workflow";

export type AppToolMeta = {
  name: string;
  description: T;
  args: { name: string; type: string; required?: boolean }[];
  uiResourceUri?: string;
  scope: string; // OAuth scope this tool requires (enforced by the host)
};

export type AppScope = { id: string; label: T };

export type RaiApp = {
  id: string;
  name: string;
  tagline: T;
  description: T;
  category: AppCategory;
  categoryLabel: T;
  icon: string;
  color: string;
  developer: string;
  featured?: boolean;
  uiResourceUri: string;
  tools: AppToolMeta[];
  scopes: AppScope[];
  mcpEndpoint: string; // where the real MCP server lives (/mcp)
  community?: boolean; // true for approved third-party submissions
};

export const categories: { id: AppCategory | "all"; label: T }[] = [
  { id: "all", label: t("All", "Tất cả") },
  { id: "property", label: t("Real estate", "Bất động sản") },
  { id: "design", label: t("Design", "Thiết kế") },
  { id: "workflow", label: t("Workflow", "Workflow") },
];

export const apps: RaiApp[] = [
  {
    id: "property",
    name: "RAI Property",
    tagline: t("Interactive real-estate map inside chat.", "Bản đồ bất động sản tương tác ngay trong hội thoại."),
    description: t(
      "Search and explore property listings on an interactive map, view details, and request advisory — all rendered directly in the conversation. Pluggable with live data from partner brokerages.",
      "Tìm và khám phá danh sách bất động sản trên bản đồ tương tác, xem chi tiết và yêu cầu tư vấn hồ sơ — render trực tiếp trong hội thoại. Sẵn sàng cắm dữ liệu thật từ sàn đối tác.",
    ),
    category: "property",
    categoryLabel: t("Real estate", "Bất động sản"),
    icon: "home",
    color: "#2E75B6",
    developer: "RAI ONE",
    featured: true,
    uiResourceUri: "ui://rai/property-map",
    tools: [
      { name: "show_property_listings", description: t("Show property listings on an interactive map.", "Hiển thị danh sách BĐS trên bản đồ tương tác."), args: [{ name: "area", type: "string", required: true }, { name: "maxPrice", type: "number" }, { name: "type", type: "string" }], uiResourceUri: "ui://rai/property-map", scope: "read:listings" },
      { name: "get_property_detail", description: t("Get full detail for one property.", "Lấy chi tiết một bất động sản."), args: [{ name: "id", type: "string", required: true }], scope: "read:listings" },
    ],
    scopes: [
      { id: "read:listings", label: t("Read property listings", "Đọc danh sách BĐS") },
      { id: "contact:advisor", label: t("Send advisory requests", "Gửi yêu cầu tư vấn") },
    ],
    mcpEndpoint: "https://property.rai.one/mcp",
  },
  {
    id: "designer",
    name: "RAI Designer",
    tagline: t("Generate layouts on a canvas in chat.", "Sinh layout trên canvas ngay trong hội thoại."),
    description: t(
      "Describe what you want and RAI Designer generates a layout on an interactive canvas you can iterate on and export. Brings the RAI AI design platform into the conversation.",
      "Mô tả mong muốn và RAI Designer sinh layout trên canvas tương tác để bạn lặp lại và xuất ảnh. Đưa nền tảng thiết kế AI của RAI vào hội thoại.",
    ),
    category: "design",
    categoryLabel: t("Design", "Thiết kế"),
    icon: "sparkles",
    color: "#C9A227",
    developer: "RAI LAB",
    featured: true,
    uiResourceUri: "ui://rai/designer-canvas",
    tools: [
      { name: "generate_design", description: t("Generate a layout from a text prompt.", "Sinh layout từ mô tả văn bản."), args: [{ name: "prompt", type: "string", required: true }], uiResourceUri: "ui://rai/designer-canvas", scope: "generate:design" },
    ],
    scopes: [{ id: "generate:design", label: t("Generate designs", "Sinh thiết kế") }],
    mcpEndpoint: "https://designer.rai.one/mcp",
  },
  {
    id: "workflow",
    name: "RAI Workflow",
    tagline: t("Run automations by natural language.", "Chạy automation bằng ngôn ngữ tự nhiên."),
    description: t(
      "Trigger n8n automations from chat and track progress step by step. The AI agent runs the sprint; you watch it work. Connects to RAI's existing n8n MCP.",
      "Kích hoạt automation n8n từ hội thoại và theo dõi tiến độ từng bước. Trợ lý ảo chạy đợt làm việc; bạn theo dõi. Kết nối n8n MCP có sẵn của RAI.",
    ),
    category: "workflow",
    categoryLabel: t("Workflow", "Workflow"),
    icon: "bolt",
    color: "#0F2A47",
    developer: "RAI LAB",
    uiResourceUri: "ui://rai/workflow-runner",
    tools: [
      { name: "run_workflow", description: t("Run a workflow and stream progress.", "Chạy workflow và truyền tiến độ."), args: [{ name: "id", type: "string", required: true }, { name: "params", type: "object" }], uiResourceUri: "ui://rai/workflow-runner", scope: "run:workflow" },
    ],
    scopes: [
      { id: "run:workflow", label: t("Run workflows", "Chạy workflow") },
      { id: "read:status", label: t("Read run status", "Đọc trạng thái chạy") },
    ],
    mcpEndpoint: "https://workflow.rai.one/mcp",
  },
];

export const getApp = (id: string) => apps.find((a) => a.id === id);
