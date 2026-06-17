/**
 * RAI Code — source layer (repos + SPDX licenses + instant deploy).
 * Catalog + seed repos served read-only via /api/code; user repos (create /
 * import / edit / deploy / domains) live in the client store. In-memory seed;
 * production = PostgreSQL + git store (isomorphic-git) + container build runner.
 */
import { t, type T } from "@/lib/i18n-core";

/* ----------------------------- licenses (SPDX) -------------------------- */
export type LicenseCategory = "permissive" | "copyleft_weak" | "copyleft_strong" | "source_available" | "commercial" | "proprietary";

export type License = {
  spdxId: string;
  fullName: string;
  category: LicenseCategory;
  osiApproved: boolean;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  blurb: T;
  url: string;
};

export const categoryLabels: Record<LicenseCategory, T> = {
  permissive: t("Permissive", "Dễ dãi"),
  copyleft_weak: t("Weak copyleft", "Copyleft yếu"),
  copyleft_strong: t("Strong copyleft", "Copyleft mạnh"),
  source_available: t("Source-available", "Nguồn mở giới hạn"),
  commercial: t("Commercial", "Thương mại"),
  proprietary: t("Proprietary", "Độc quyền"),
};
export const categoryColor: Record<LicenseCategory, string> = {
  permissive: "#1D9E75", copyleft_weak: "#2E75B6", copyleft_strong: "#C9A227", source_available: "#7A5CFF", commercial: "#0F2A47", proprietary: "#E24B4A",
};

export const licenses: License[] = [
  { spdxId: "MIT", fullName: "MIT License", category: "permissive", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "private-use"], conditions: ["include-copyright"], limitations: ["liability", "warranty"], url: "https://spdx.org/licenses/MIT", blurb: t("Use, modify, sell, even closed-source. Keep the copyright notice.", "Dùng, sửa, bán, kể cả đóng nguồn. Giữ thông báo bản quyền.") },
  { spdxId: "Apache-2.0", fullName: "Apache License 2.0", category: "permissive", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "patent-use", "private-use"], conditions: ["include-copyright", "state-changes"], limitations: ["trademark-use", "liability", "warranty"], url: "https://spdx.org/licenses/Apache-2.0", blurb: t("Permissive with an explicit patent grant.", "Dễ dãi, có cấp phép sáng chế rõ ràng.") },
  { spdxId: "BSD-3-Clause", fullName: "BSD 3-Clause", category: "permissive", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "private-use"], conditions: ["include-copyright"], limitations: ["liability", "warranty"], url: "https://spdx.org/licenses/BSD-3-Clause", blurb: t("Permissive; no endorsement using the author's name.", "Dễ dãi; không dùng tên tác giả để quảng bá.") },
  { spdxId: "LGPL-3.0", fullName: "GNU Lesser GPL v3", category: "copyleft_weak", osiApproved: true, permissions: ["commercial-use", "modify", "distribute"], conditions: ["disclose-source", "same-license-library"], limitations: ["liability", "warranty"], url: "https://spdx.org/licenses/LGPL-3.0", blurb: t("Use & sell; modifications to the library must stay open.", "Dùng & bán; phần sửa thư viện phải mở.") },
  { spdxId: "MPL-2.0", fullName: "Mozilla Public License 2.0", category: "copyleft_weak", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "patent-use"], conditions: ["disclose-source", "same-license-file"], limitations: ["liability", "trademark-use", "warranty"], url: "https://spdx.org/licenses/MPL-2.0", blurb: t("File-level copyleft; modified files stay open.", "Copyleft theo file; file sửa phải mở.") },
  { spdxId: "GPL-3.0", fullName: "GNU GPL v3", category: "copyleft_strong", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "patent-use"], conditions: ["disclose-source", "same-license", "state-changes"], limitations: ["liability", "warranty"], url: "https://spdx.org/licenses/GPL-3.0", blurb: t("Derivatives must be open under the same license.", "Sản phẩm phái sinh phải mở cùng giấy phép.") },
  { spdxId: "AGPL-3.0", fullName: "GNU Affero GPL v3", category: "copyleft_strong", osiApproved: true, permissions: ["commercial-use", "modify", "distribute", "patent-use"], conditions: ["disclose-source", "same-license", "network-use-disclose"], limitations: ["liability", "warranty"], url: "https://spdx.org/licenses/AGPL-3.0", blurb: t("Like GPL, and applies even when run over a network.", "Như GPL, áp cả khi chạy qua mạng.") },
  { spdxId: "BUSL-1.1", fullName: "Business Source License 1.1", category: "source_available", osiApproved: false, permissions: ["modify", "private-use"], conditions: ["disclose-source", "include-copyright"], limitations: ["commercial-use-restricted"], url: "https://spdx.org/licenses/BUSL-1.1", blurb: t("View/modify; commercial use restricted for a term, then converts.", "Xem/sửa; hạn chế dùng thương mại trong thời hạn, sau đó chuyển đổi.") },
  { spdxId: "Elastic-2.0", fullName: "Elastic License 2.0", category: "source_available", osiApproved: false, permissions: ["modify", "private-use", "distribute"], conditions: ["include-copyright"], limitations: ["managed-service-restricted"], url: "https://spdx.org/licenses/Elastic-2.0", blurb: t("Source-available; no providing it as a managed service.", "Source-available; không cung cấp dạng dịch vụ vận hành.") },
  { spdxId: "LicenseRef-RAI-Commercial", fullName: "RAI Commercial License", category: "commercial", osiApproved: false, permissions: ["commercial-use", "modify", "private-use"], conditions: ["paid-contract"], limitations: ["redistribute-restricted"], url: "https://raiholdings.vn/licenses/commercial", blurb: t("Commercial use under a paid RAI contract; pairs with a marketplace plan.", "Dùng thương mại theo hợp đồng RAI có phí; gắn với gói ở marketplace.") },
  { spdxId: "LicenseRef-RAI-Proprietary", fullName: "RAI Proprietary", category: "proprietary", osiApproved: false, permissions: ["private-use"], conditions: ["explicit-permission"], limitations: ["redistribute-restricted", "commercial-use-restricted"], url: "https://raiholdings.vn/licenses/proprietary", blurb: t("All rights reserved; use only under a specific grant.", "Bảo lưu mọi quyền; chỉ dùng theo cấp phép riêng.") },
];

export const getLicense = (spdx: string) => licenses.find((l) => l.spdxId === spdx);

/** Outbound compatibility: can a derivative of `upstream` be relicensed as `target`? */
export function licenseCompatible(upstream: string, target: string): { ok: boolean; reason?: T } {
  const u = getLicense(upstream);
  if (!u) return { ok: true };
  if (u.category === "copyleft_strong" && (target === "LicenseRef-RAI-Commercial" || target === "LicenseRef-RAI-Proprietary" || getLicense(target)?.category === "permissive")) {
    return { ok: false, reason: t(`Derivatives of ${upstream} must stay under ${upstream} (or compatible). They cannot be relicensed as ${target}.`, `Sản phẩm phái sinh từ ${upstream} phải giữ ${upstream} (hoặc tương thích). Không thể đổi sang ${target}.`) };
  }
  if (u.category === "source_available" && (target === "LicenseRef-RAI-Commercial" || getLicense(target)?.category === "permissive")) {
    return { ok: false, reason: t(`${upstream} restricts commercial reuse; relicensing as ${target} may violate its terms.`, `${upstream} hạn chế dùng lại thương mại; đổi sang ${target} có thể vi phạm điều khoản.`) };
  }
  return { ok: true };
}

/* ----------------------------- repositories ----------------------------- */
export type DeployStatus = "live" | "draft";
export type Repo = {
  id: string; owner: string; name: string; slug: string; description: T;
  visibility: "public" | "private" | "internal"; defaultBranch: string;
  language: string[]; topics: string[]; licenseSpdx: string;
  sourceOrigin: "created" | "imported" | "forked"; upstreamRef?: { url: string; license: string };
  starCount: number; forkCount: number; updatedAt: string;
  deployStatus: DeployStatus; deployUrl?: string;
  files: Record<string, string>;
};

const README = (name: string, desc: string) => `# ${name}\n\n${desc}\n\n## Getting started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`;
const PKG = (name: string, scripts: Record<string, string>) => JSON.stringify({ name, version: "1.0.0", private: true, scripts }, null, 2);

const SEED: Repo[] = [
  {
    id: "repo-1", owner: "rai", name: "property-portal", slug: "rai/property-portal", description: t("NOXH real-estate portal — React + Vite.", "Cổng thông tin BĐS NOXH — React + Vite."),
    visibility: "public", defaultBranch: "main", language: ["TypeScript", "React"], topics: ["realestate", "vite"], licenseSpdx: "MIT", sourceOrigin: "created", starCount: 240, forkCount: 31, updatedAt: "2026-06-15T00:00:00Z", deployStatus: "live", deployUrl: "https://property.apps.raiholdings.vn",
    files: { "README.md": README("property-portal", "NOXH real-estate portal."), "LICENSE": "MIT License\n\nCopyright (c) 2026 RAI Holdings", "package.json": PKG("property-portal", { dev: "vite", build: "vite build" }), "src/main.tsx": "import { createRoot } from 'react-dom/client'\nimport App from './App'\ncreateRoot(document.getElementById('root')!).render(<App/>)\n", "src/App.tsx": "export default function App(){\n  return <h1>RAI Property Portal</h1>\n}\n" },
  },
  {
    id: "repo-2", owner: "rai", name: "designer-canvas", slug: "rai/designer-canvas", description: t("AI design canvas component library.", "Thư viện component canvas thiết kế AI."),
    visibility: "public", defaultBranch: "main", language: ["TypeScript", "React"], topics: ["design", "canvas"], licenseSpdx: "Apache-2.0", sourceOrigin: "created", starCount: 88, forkCount: 9, updatedAt: "2026-06-10T00:00:00Z", deployStatus: "draft",
    files: { "README.md": README("designer-canvas", "AI design canvas library."), "LICENSE": "Apache License 2.0", "package.json": PKG("designer-canvas", { build: "tsup" }), "src/index.ts": "export const VERSION = '1.0.0'\n" },
  },
  {
    id: "repo-3", owner: "rai", name: "workflow-api", slug: "rai/workflow-api", description: t("n8n-backed workflow API — Node.", "API workflow trên nền n8n — Node."),
    visibility: "internal", defaultBranch: "main", language: ["TypeScript", "Node"], topics: ["workflow", "api"], licenseSpdx: "LicenseRef-RAI-Commercial", sourceOrigin: "created", starCount: 51, forkCount: 3, updatedAt: "2026-06-16T00:00:00Z", deployStatus: "live", deployUrl: "https://workflow-api.apps.raiholdings.vn",
    files: { "README.md": README("workflow-api", "Workflow API on n8n."), "LICENSE": "RAI Commercial License — see https://raiholdings.vn/licenses/commercial", "package.json": PKG("workflow-api", { start: "node server.js" }), "server.js": "import http from 'node:http'\nhttp.createServer((_,res)=>res.end('RAI Workflow API')).listen(3000)\n" },
  },
];

const store: Repo[] = [...SEED];

/* ----------------------------- queries ---------------------------------- */
export type ListParams = { search?: string; license?: string; language?: string; status?: DeployStatus; owner?: string };
export function listRepos(params: ListParams, extra: Repo[] = []): Repo[] {
  let rows = [...store, ...extra];
  if (params.license) rows = rows.filter((r) => r.licenseSpdx === params.license);
  if (params.language) rows = rows.filter((r) => r.language.includes(params.language!));
  if (params.status) rows = rows.filter((r) => r.deployStatus === params.status);
  if (params.owner) rows = rows.filter((r) => r.owner === params.owner);
  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((r) => (r.slug + " " + JSON.stringify(r.description) + " " + r.topics.join(" ")).toLowerCase().includes(q));
  }
  return rows.sort((a, b) => b.starCount - a.starCount);
}
export const getRepo = (owner: string, name: string, extra: Repo[] = []) => [...store, ...extra].find((r) => r.owner === owner && r.name === name);
export const allLanguages = () => Array.from(new Set(store.flatMap((r) => r.language)));
export const allOwners = () => Array.from(new Set(store.map((r) => r.owner)));
