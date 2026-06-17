import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: the app uses SSR + force-dynamic API routes + SSG pages, but no
// ISR / on-demand revalidation, so no R2 incremental cache is required. Add an R2
// incremental cache here later if you start using `revalidate`.
export default defineCloudflareConfig({});
