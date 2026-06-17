import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5273 },
  // Wipe dist on every build so a stale `_redirects` restored from Cloudflare's
  // build-output cache can never sneak back into the upload.
  build: { emptyOutDir: true },
  // Admin uses antd (no Tailwind). Pin an empty inline PostCSS config so Vite does
  // NOT walk up and pick the Next app's root postcss.config.mjs (@tailwindcss/postcss).
  css: { postcss: {} },
});
