const api = globalThis.browser ?? globalThis.chrome;
const input = document.getElementById("base");
const ok = document.getElementById("ok");

api.storage.sync.get("base").then((s) => { input.value = s.base || "https://raiholdings.vn"; });

document.getElementById("save").addEventListener("click", async () => {
  const base = (input.value || "https://raiholdings.vn").trim().replace(/\/$/, "");
  await api.storage.sync.set({ base });
  ok.textContent = "Đã lưu ✓";
  setTimeout(() => (ok.textContent = ""), 2000);
});
