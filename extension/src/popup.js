// RAI OS extension popup. Cross-browser (chrome/browser). No secrets, no tokens —
// opens raiholdings.vn in a tab, reusing the user's existing session (SSO).
const api = globalThis.browser ?? globalThis.chrome;
const DEFAULT_BASE = "https://raiholdings.vn";

async function base() {
  try { const s = await api.storage.sync.get("base"); return (s.base || DEFAULT_BASE).replace(/\/$/, ""); }
  catch { return DEFAULT_BASE; }
}

function openTab(url) { api.tabs.create({ url }); window.close(); }

// Injected into the page to capture lightweight business info.
function scrape() {
  const meta = (n) => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || "";
  const text = document.body?.innerText || "";
  const phone = (text.match(/(?:0|\+84)\d[\d .\-()]{7,}/) || [""])[0].trim();
  const email = (text.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/) || [""])[0];
  return { title: document.title || "", url: location.href, description: meta("description") || meta("og:description"), site: meta("og:site_name"), phone, email };
}

async function saveCurrent() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  let info = { title: tab.title || "", url: tab.url || "" };
  try {
    const res = await api.scripting.executeScript({ target: { tabId: tab.id }, func: scrape });
    if (res && res[0]?.result) info = res[0].result;
  } catch { /* restricted page → use tab title/url */ }
  const idea = `Doanh nghiệp từ web: ${info.site || info.title}. ${info.description || ""} Nguồn: ${info.url}${info.phone ? " · ĐT: " + info.phone : ""}${info.email ? " · " + info.email : ""}`.trim();
  openTab(`${await base()}/workspace/build?idea=${encodeURIComponent(idea)}`);
}

document.querySelectorAll("[data-go]").forEach((b) =>
  b.addEventListener("click", async () => openTab((await base()) + b.dataset.go))
);
document.getElementById("save").addEventListener("click", saveCurrent);
document.getElementById("opts").addEventListener("click", (e) => { e.preventDefault(); api.runtime.openOptionsPage(); });
