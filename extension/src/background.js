// RAI OS extension background. Context menu "Lưu vào RAI OS" + (future) agent
// status notifications. Cross-browser; opens raiholdings.vn (reuses session/SSO).
const api = globalThis.browser ?? globalThis.chrome;
const DEFAULT_BASE = "https://raiholdings.vn";

async function base() {
  try { const s = await api.storage.sync.get("base"); return (s.base || DEFAULT_BASE).replace(/\/$/, ""); }
  catch { return DEFAULT_BASE; }
}

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.create({ id: "rai-save", title: "Lưu vào RAI OS", contexts: ["page", "selection", "link"] });
});

function scrape() {
  const meta = (n) => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || "";
  return { title: document.title || "", url: location.href, description: meta("description") || meta("og:description"), site: meta("og:site_name") };
}

api.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "rai-save") return;
  let data = { title: tab?.title || "", url: info.pageUrl || tab?.url || "", description: "", site: "" };
  if (tab?.id) {
    try { const r = await api.scripting.executeScript({ target: { tabId: tab.id }, func: scrape }); if (r?.[0]?.result) data = r[0].result; }
    catch { /* restricted */ }
  }
  const sel = info.selectionText ? ` Ghi chú: ${info.selectionText}` : "";
  const idea = `Doanh nghiệp từ web: ${data.site || data.title}. ${data.description || ""} Nguồn: ${data.url}${sel}`.trim();
  api.tabs.create({ url: `${await base()}/workspace/build?idea=${encodeURIComponent(idea)}` });
});

// Helper for future use: surface an agent/venture status notification.
// (No live source wired yet — kept for P-later integration with the workspace.)
function notify(title, message) {
  try { api.notifications.create({ type: "basic", iconUrl: "icons/icon-128.png", title, message }); } catch { /* */ }
}
globalThis.raiNotify = notify;
