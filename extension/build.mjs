// Build the RAI OS extension for Chrome/Edge (MV3 service_worker) and Firefox
// (MV3 background.scripts + gecko id) from one src/. No deps.
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
const base = JSON.parse(readFileSync(join(src, "manifest.base.json"), "utf8"));

function build(name, manifest) {
  const out = join(dist, name);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(src, out, { recursive: true, filter: (s) => !s.endsWith("manifest.base.json") });
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("✓ built", name);
}

mkdirSync(dist, { recursive: true });
build("chrome", { ...base, background: { service_worker: "background.js" } });
build("firefox", {
  ...base,
  background: { scripts: ["background.js"] },
  browser_specific_settings: { gecko: { id: "rai-os@raiholdings.vn", strict_min_version: "121.0" } },
});
console.log("done → load unpacked from extension/dist/{chrome,firefox}");
