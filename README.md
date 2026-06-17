# RAI Holdings OS

The **Venture Operating System (VOS)** for the AI-native economy — the orchestration
layer over capital, technology, and commerce. One master brand, four operating entities,
six infrastructure layers, 35 products, 8 Business-In-A-Box verticals.
*Build once, deploy everywhere.*

Implemented to **RAI Brand Guidelines v1.0.0** (light warm-gray system, flat entity
colors, Space Grotesk / Inter / JetBrains Mono, weights 400/500 only, borders not shadows,
no gradients · shadows · glow · emoji). Bilingual **EN (default) + VI**.

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack, RSC) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Fonts | Space Grotesk (display) · Inter (body) · JetBrains Mono (metadata) |
| i18n | Lightweight client context (EN/VI), no extra deps |

## Run

```bash
npm install
npm run dev        # http://localhost:4173        (public site)
                   # http://localhost:4173/app    (OS Console)
npm run build
npm run typecheck
```

> After adding/removing routes under `/app`, run `rm -rf .next` before building
> (Next caches route validator types).

## Brand design system

`src/app/globals.css` `@theme` — warm-gray neutrals (`--color-bg` `#F8F7F2`, `surface`
`#FFF`, `text` `#2C2C2A`), flat entity primaries: Holdings `#378ADD` (accent),
FUND `#0C447C`, LAB `#0F6E56`, ONE `#3B6D11`. Utilities: `.label` (ALL CAPS tracked),
`.mono` (JetBrains Mono metadata), `.accent-rule` (24×3px section accent).
Icons: Tabler outline, 1.5px (`src/components/ui/Icon.tsx`).

## Structure

```
src/
  app/
    page.tsx              # Public site (scrolling, brand-reskinned)
    app/                  # OS CONSOLE
      page.tsx            #   Overview — entities, ventures, proof metrics
      ventures/           #   BIAB deployments across 8 verticals
      products/           #   RAI LAB product stack (6 layers × 35)
      capital/            #   RAI FUND capital & portfolio
      metrics/            #   North Star tower + revenue by entity
      ecosystem/          #   Entities + verticals
    api/lead/route.ts     # Lead capture stub
  components/
    layout/               # Navbar, Footer (brand, EN/VI toggle)
    sections/             # Hero, ProofStats, Entities, Layers, Verticals, Thesis, Cta
    ui/                   # Container, Button, Section, SectionHeading, Reveal, Icon, Logo
    dash/                 # Sidebar, Panel, KpiCard, Badge, Table, PageHeader, tone
      charts/             #   AreaLine, Donut, Funnel, BarRow (SVG, brand colors)
  lib/
    i18n-core.ts          # Server-safe T type + t() helper
    i18n.tsx              # LangProvider + useLang() (client)
    content.ts            # Public-site content (bilingual, VOS)
    dashboard.ts          # Console data (bilingual mock — swap for DB)
    site.ts, dash-nav.ts, cn.ts
legacy/                   # Original static HTML (reference)
```

## RAI Apps (`/apps`) — MCP Apps host (SEP-1865)

AI-native apps that run **inside the conversation** — each app is an MCP server
registering a `ui://` resource + tools (per the MCP Apps Extension, SEP-1865).

- `/apps` — directory: featured, grid, search, category filter (`src/app/apps/page.tsx`).
- `/apps/[id]` — app detail: description, tools, permissions/scopes, UI resource.
- `/apps/host` — **host playground**: `@`-mention to launch an app, its UI renders
  in a strict **sandboxed iframe** (`allow-scripts`, no `allow-same-origin`), tool
  calls from the UI ask for **consent** and stream to an **audit log**; a
  "text-only host" toggle proves the **fallback text** path.
- 3 pilot apps (`src/lib/apps.ts` + `src/lib/apps-mcp.ts`): **RAI Property** (interactive
  map + cards + detail), **RAI Designer** (layout canvas), **RAI Workflow** (n8n run steps).

The bridge (`src/components/apps/McpAppFrame.tsx`) speaks MCP JSON-RPC over
`postMessage`. In production each app is a real MCP server at `/mcp`; here the server
logic + `ui://` template run in-browser so the full UI↔host loop is demonstrable.
See `SUBMISSION_GUIDELINES.md` for publishing apps.

**Phase 4 — submit & review:** `/apps/submit` (form + live auto-validation: endpoint `/mcp`,
`ui://` scheme, fallback text, scopes) → `/apps/review` (auto-checks + curation checklist +
`submitted → in_review → approved/rejected` + reviewer note). Approved apps auto-appear in
`/apps` (tagged `community`).

**Phase 5 — identity & billing:** connecting an app shows an **OAuth 2.1-style authorization
screen** (`PermissionConsent`) granting scopes + issuing a scoped token. The host **enforces
scopes** on every tool call (denies out-of-scope), **meters usage** per app/tool, and
`/apps/billing` shows connections, metered usage, free/premium plans, and the **70/30
revenue-share schema** with developers/OPCs. State persists via `src/lib/apps-store.ts`
(localStorage; swap for a backend).

> Status: SPEC.md Phases 1–5 implemented (in-browser MCP servers + client state instead of a
> separate Node `/mcp` + DB). Remaining for production: real Node MCP SDK servers, a
> submissions/OAuth/billing backend, and a payment gateway.

## RAI MCP Registry (`/mcp`) — Official MCP Registry API

An internal MCP **metaregistry** (like github.com/mcp) compatible with the Official MCP
Registry API + `server.json` schema (2025-12-11). Stores **metadata only** — never code.

- **API** `/api/mcp/v0/*` (Next route handlers, `src/lib/mcp-registry.ts`):
  - `GET /servers?limit=&cursor=&search=&updated_since=` — cursor pagination + search + sync filter.
  - `GET /servers/{id-or-name}?version=latest` — detail + all versions.
  - `POST /publish` — validate `server.json` + **namespace auth** (`vn.rai/*` → `rai_` token +
    RAI-domain remote policy; `io.github.*` → `ghp_`), multi-version.
- **UI**: `/mcp` (hero "Connect models to the real world" + search + count + card grid +
  cursor pagination), `/mcp/[namespace]/[name]` (full metadata: packages/remotes/env +
  versions), `InstallModal` (config snippet for Claude Code / Desktop / RAI ONE per
  transport), `/mcp/publish` (compose `server.json` + live preview + publish).
- Seed: 3 RAI servers (`vn.rai/*`) + 5 community (`io.github.*`).

**Phase 5 — sync + CLI:**
- `POST /api/mcp/v0/sync` pulls servers from the **official registry**
  (`registry.modelcontextprotocol.io`, with an offline fixture fallback) and queues community
  imports for **manual review**; `POST /api/mcp/v0/sync/moderate` approves/rejects them. UI at
  `/mcp/sync` (run sync + pending queue + approve/reject). Only approved imports go live.
- **CLI** `cli/rai-mcp-publisher.mjs` (`npm run rai-mcp -- <cmd>`): `init` (server.json template),
  `login`, `whoami`, `publish`, `logout`. See `cli/README.md`.

> Status: SPEC_MCP.md Phases 0–5 implemented (in-memory store + Next route handlers instead of
> Go/Node + PostgreSQL). Production: swap the store for PostgreSQL behind the same `/v0` API.

## RAI Marketplace (`/marketplace`) — commerce layer

GitHub-Marketplace-style storefront over `/apps` + `/mcp`. A listing adds commercial
metadata (price, plans, publisher, rating) and points to a technical artifact via
`artifactRef` — it never duplicates run logic. **Prices in VND.**

- **API** `/api/marketplace/v0/listings` (filter by type/category/price/compat/verified +
  search) and `/listings/[slug]` (`src/lib/marketplace.ts`).
- **UI**: `/marketplace` (hero + search + filter sidebar + category rails + card grid with
  pricing/verified badges + pagination), `/marketplace/[slug]` (detail + **PricingTable** with
  monthly/yearly toggle + buy/install + link to the `/apps` or `/mcp` artifact + reviews).
- **Phase 4** — `/marketplace/publish` (register publisher → **verify org** to sell paid →
  publish wizard with artifact validation against `/apps`/`/mcp`) → `/marketplace/review`
  (auto-checks + checklist + `submitted→in_review→approved/rejected/suspended`). Approved
  listings appear in the marketplace.
- **Phase 5** — `/marketplace/billing`: subscriptions, the `marketplace_purchase` event log
  (purchased/changed/cancelled/pending_change), **14-day free trial**, **upgrade-now /
  downgrade-end-of-cycle**, and the **70/30 revenue-share** schema. Pricing rules: only
  verified publishers sell paid; every paid plan has both monthly + yearly VND. Client state
  in `src/lib/marketplace-store.ts` (localStorage; production = backend + payment gateway).

Linked from the homepage **Solutions** menu (Marketplace · Apps · MCP Registry).

## RAI Code (`/code`) — source layer

GitHub-repos-style source layer with **SPDX licensing** and **instant deploy** — create a repo,
pick a license, attach a domain, and it runs, all inside RAI OS. Links to the other layers via
repo references (`/mcp`, `/apps`, `/marketplace`).

- **API** `/api/code/v0/repos` (filter by license/language/status/owner + search),
  `/repos/[owner]/[repo]`, `/licenses` (`src/lib/code.ts` — SPDX catalog: 6 groups +
  `LicenseRef-RAI-Commercial` / `LicenseRef-RAI-Proprietary`; seed 3 RAI repos).
- **UI**: `/code` (hero + create/import + filter sidebar + repo cards with license &
  deploy-status badges + pagination), `/code/[owner]/[repo]` (tabs **Code** with file tree +
  editor + commit / **Issues** / **Pull requests** / **Deploy** / **License**),
  `/code/new` (create from template + license + visibility), `/code/import` (read upstream
  license + compatibility before confirm), `/code/licenses` (SPDX catalog).
- **Deploy** (`src/lib/code-store.ts`): auto build config → streamed build log → live
  `*.apps.raiholdings.vn` URL → immutable deployments + **instant rollback**; **custom domain**
  → DNS record → verify → **auto SSL**; runtimes static/node/container.
- **License compliance**: `licenseCompatible()` blocks relicensing a strong-copyleft /
  source-available upstream as permissive/commercial.

Linked from the homepage **Solutions** menu (Marketplace · Code · Apps · MCP).
Client state in `code-store.ts` (localStorage; production = git store + container runner + edge proxy).

## RAI Enterprise (`/enterprise`) — content & GTM layer

Content-as-data Enterprise area: three segmentation axes — **BY COMPANY SIZE /
BY USE CASE / BY INDUSTRY** — each resolving to a block-based BOFU landing page.
Content is structured data so the admin CMS and an AI pipeline can edit it
safely; nothing AI- or community-authored reaches public without review.

- **Tab** on the homepage nav (immediately after **Ecosystem**) → mega-menu with
  the 3 axes. Hub at `/enterprise` shows all three columns + planned segments + CTA.
- **Data** `src/lib/enterprise.ts` (server-safe): 9 block types
  (hero/metric_strip/pain_solution/feature_grid/use_case_steps/proof/comparison/faq/cta_band),
  seed pages (size: startup-opc, sme, enterprise · use-case: automation, data-analytics ·
  industry: real-estate, finance), and metrics with `dataSource`. `system_query`
  metrics compute **live** from /apps, /marketplace, /code — no fabricated numbers.
- **Landing** `/enterprise/[axis]/[slug]` — block renderer (`components/enterprise/blocks.tsx`),
  SSG-prerendered for SEO, bilingual, brand v1.0.0; proof sits next to the CTA. `LandingView`
  applies admin overrides on the client.
- **API** `/api/enterprise/v0/*` (`force-dynamic`): `pages` (list, `?axis=&full=1`),
  `pages/[axis]/[slug]` (published page), `metrics` (resolved values),
  `ai/run` (drafting job).
- **Admin CMS** `/admin/enterprise` (`enterprise-store.ts`, localStorage): page list +
  **AI draft** button, block **editor** (reorder / add / remove / show-hide / JSON edit /
  publish-unpublish), **review queue** (AI + community: diff + rationale + approve/reject),
  **metric manager** (refresh from system → queues a `metric_refresh` suggestion),
  **version history + rollback**, **contributors** (reputation).
- **AI drafting** `src/lib/enterprise-ai.ts` (server): calls the Anthropic Messages API
  (`claude-sonnet-4-6`, `x-api-key` + `anthropic-version: 2023-06-01`) when
  `ANTHROPIC_API_KEY` is set, else a deterministic, system-data-aware template so the
  pipeline runs offline. **Guardrails** validate the block schema and block any number
  not traceable to system data. Drafts go to the review queue with a `rationale` —
  **never auto-published**.
- **Community** `/enterprise/contribute` → submission enters the **same review queue**
  (`origin: community`) and creates/updates a contributor with a reputation score.

> Status: SPEC_ENTERPRISE.md Phases 0–5 implemented (in-memory seed + Next route handlers +
> client store instead of PostgreSQL + a job queue + an admin auth layer). Production:
> swap the store for PostgreSQL behind the same `/v0` API, run `ai/run` from a cron/queue,
> and gate `/admin/enterprise` behind admin/editor auth.

## RAI Pricing (`/pricing`) — pricing-as-data

A `github.com/pricing`-style page: trial banner, hero + a **3-way segment toggle
Business · Programs · Platform** (Doanh nghiệp / Chương trình / Nền tảng — filters
the plan cards by `plan.kind`), plan cards, additional add-ons, social proof, and a
grouped **Compare features** table. Reached from a **standalone "Pricing" tab** in
the homepage navbar (next to Resources). All prices in **VND**.

- **Business** (`kind:"subscription"`): Free · Team · Business.
- **Programs** (`kind:"program"`): a series of **AI-native venture builder programs
  by industry** — Proptech · Fintech · Retail · Healthtech · Agritech (built via
  `mkProgram`, each with AI-agent + platform + scope highlightGroups and a detail page).
- **Platform** (`kind:"platform"`): per-platform pricing across the RAI ecosystem,
  from the business platform to SaaS/PaaS — RAI ONE · RAI Apps (MCP host) · RAI Code
  (PaaS) · RAI MCP Registry (SaaS) · RAI Marketplace (built via `mkPlatform`). Reuses the Enterprise "AI proposes → human reviews" model — AI never
publishes and never sets a price.

- **Data** `src/lib/pricing.ts` (server-safe): `Plan` (kind `subscription` |
  `program`), `PlanFeatureItem`, `AddOn`, `ComparisonGroup/Row`, one `PricingPage`.
  Seed: **Free / Team / Business** (subscription) + **RAI Proptech AI-native 2026**
  (program, `kind:"program"`) with `highlightGroups` (AI agents · platforms · scope).
  `planPrice(plan, cycle)` resolves the displayed VND amount.
- **Public** `/pricing` — `components/pricing/PricingView.tsx` (banner, hero,
  **SegmentToggle** filtering cards by `plan.kind` — Business=subscription /
  Programs=program, PlanCard with Recommended badge + "Show features" expand +
  featured add-ons + program highlightGroups, additional add-ons, proof,
  CompareTable over all plans with a mobile plan-picker, FAQ). `/pricing/[key]` — SSG **program/plan detail**
  (`PlanDetail.tsx`: highlightGroups + included features + contact CTA).
- **API** `/api/pricing/v0/*` (`force-dynamic`): `page`, `plans/[key]`, `ai/run`.
- **Admin CMS** `/admin/pricing` (`pricing-store.ts`, localStorage): **Plans**
  (reorder / add / remove / set Recommended / edit VND price inline / JSON-edit the
  full plan incl. featureItems + highlightGroups + CTAs / per-plan **AI draft**),
  **Compare** (JSON editor for groups/rows/values), **Banner & hero** (bilingual
  inputs), **Review queue** (AI + community: rationale + proposed diff +
  approve/reject), **Versions** (rollback — important for price changes),
  **Contributors** (reputation). Publish/unpublish + save-version at the top.
- **AI editing** `src/lib/pricing-ai.ts` (server): Anthropic Messages API
  (`claude-sonnet-4-6`) when `ANTHROPIC_API_KEY` is set, else a deterministic
  system-data-aware template. Guardrails block any number not traceable to system
  data — **no fabricated prices**; drafts carry a `rationale` and go to the review
  queue, **never auto-published**.
- **Community** `/pricing/contribute` → same review queue (`origin: community`) +
  contributor reputation.

> Status: SPEC_PRICING.md Phases 0–5 implemented (in-memory seed + Next route handlers +
> client store instead of PostgreSQL + a job queue + admin auth). Production: swap the
> store for PostgreSQL behind the same `/v0` API, run `ai/run` from a cron/queue, gate
> `/admin/pricing` behind admin/editor auth, and wire plan purchase to `/marketplace`.

## RAI Company / About (`/about`) — brand & organization story

The **Company** tab (first tab in the homepage navbar) opens `/about` with a
**sticky sub-nav** of 8 sub-tabs. Block-based, SSR/SSG, bilingual. Positions RAI
as an **AI-native venture builder** on the MIT-inspired **Education – Research –
Innovation** model.

- **Data** `src/lib/about.ts` (server-safe): `aboutTabs` (sub-nav) + block-based
  seed pages. Block types: hero · prose (positioning/mission/vision) · metric_strip ·
  pillar_grid · entity_grid · steps · timeline · leaders_grid · partners_grid ·
  reference · contact · cta_band. Pages: about · ecosystem · how-we-work · impact ·
  leadership · partners · story · contact.
- **The integrity rule** (SPEC §1): metric strips carry a `category` —
  **`aspiration`** (RAI's MIT-inspired vision, labelled as targets, no fabricated
  numbers), **`actual`** (real RAI numbers — `apps`/`deploys` resolve **live** from
  the ecosystem via `systemMetricValue`; others are clearly-labelled placeholders),
  and **`reference`** (MIT's own figures, credited with a source link). MIT numbers
  are never presented as RAI's.
- **Render** `components/about/blocks.tsx` (`AboutBlock`/`AboutView`),
  `components/about/AboutNav.tsx` (top bar + sticky sub-nav). Pages: `/about`
  (index) + `/about/[tab]` (SSG for the other 7).
- Linked from the homepage **Company** nav group; impact/leadership pages link on to
  `/enterprise`, `/fund`, `/lab`, `/one`.

> Status: SPEC_ABOUT.md Phases 0–2 implemented (static content-as-data + block render,
> all core + supplementary pages). The optional CMS + AI metric-refresh (Phase 3) is
> not built — it would reuse the Enterprise/Pricing "AI proposes → human reviews" pattern.

## RAI Portfolio (`/portfolio`) — ecosystem catalog (v2)

The **Portfolio** tab catalogs the whole RAI ecosystem (~33 entries) across **3
sub-tabs** — **Platform development · Member companies · Investments** — mapped from
**5 strategic pillars** (Tech Business · SaaS Platform · Technology Transfer ·
Community Platform · Franchise & Venture). Each entry is a block-based profile that
links out to its own domain (e.g. raiacademy.vn). Pricing is **estimated** and
labelled as such; legal figures are omitted when unknown — never fabricated.

- **Data** `src/lib/portfolio.ts` (server-safe): `PortfolioEntry`
  (`entryType` platform/company/investment · `pillar` · `portfolioTab` · estimated
  `pricingTiers` · `stage`). Seed: **24 platforms** (8 Tech Business + 11 SaaS + 5
  Community), **3 Technology-Transfer companies** (Odoo/ERPNext/Service), **6
  investments** (5 franchise/venture models + ROI AI Việt Nam). `reservedDomains`
  registry. Block types: overview · models · pricing_table · use_cases ·
  ecosystem_links · status · contact_cta. `listEntries` (tab/pillar/sector/search),
  `getEntry`, `portfolioStats`.
- **Hub** `/portfolio` — `PortfolioView` (stat cards 24/3/6 + 3 sub-tabs, entries
  grouped by pillar, sector + search filters, EntryCard with domain + estimated price
  + stage badge). **Profile** `/portfolio/[slug]` — `blocks.tsx` (`ProfileView`):
  hero (pillar/tab/stage badges, domain "Visit platform") + block sections. Seed
  profiles SSG; AI-created entries render client-side from the store.
- **API** `/api/portfolio/v0/*` (`force-dynamic`): `entries` (list+filter),
  `entries/[slug]`, `stats` (homepage counts), `ai/draft` (`new_profile` | `update_block`).
- **Admin CMS** `/admin/portfolio` (`portfolio-store.ts`, localStorage, key
  `rai-portfolio-v2`): entry list filtered by tab (publish · feature · per-entry **AI
  refresh**), **Create with AI** (name/sector/pillar/tab/domain/notes → drafted
  profile → review queue), block **editor**, **review queue**, **versions + rollback**.
- **AI** `src/lib/portfolio-ai.ts` (server): Anthropic `claude-sonnet-4-6` (else
  template). Guardrails block numbers not in the input — **no fabricated legal/price
  figures**; **never auto-publishes**.

> Status: SPEC_PORTFOLIO.md v2 Phases 0–5 implemented (in-memory seed + Next route handlers +
> client store instead of PostgreSQL). Production: PostgreSQL behind the same `/v0` API and
> admin/editor auth on `/admin/portfolio`.

## Homepage (`/`) — live aggregation layer

The homepage is an **aggregation layer**: it creates no data, it reads live counts
from every platform and presents them as a story + real-time dashboard. Top nav:
**Company · Portfolio · Solutions · Enterprise · Resources · Pricing**.

- **Aggregation** `src/lib/home.ts` (server-safe) → `getHomeMetrics()`: reads
  `apps`, `mcp-registry`, `marketplace`, `code`, `portfolio`, `pricing` defensively
  (per-source try/catch → `stale` flag, never breaks the page) and returns a single
  `HomeMetrics` payload (stats + growth series + category distribution + recent
  activity + aspiration). Served at **`GET /api/home/metrics`** (`force-dynamic`).
- **Realtime** `components/home/LiveProvider.tsx`: SSR-seeds the dashboard with
  `getHomeMetrics()` (no layout shift), then polls `/api/home/metrics` every 20s;
  on error it keeps the last good payload and shows a "reconnecting / updated HH:MM"
  status. Shared via `useHomeMetrics()` context (one fetch for the whole page).
- **Sections** (`components/home/`): **Hero** (live counter strip) · **LiveDashboard**
  (6 stat cards with count-up + SVG sparkline + source tooltip, **Ecosystem growth**
  area chart, **By category** donut, **Recent activity** feed) · **Pillars**
  (Education/Research/Innovation) · **FeatureGrid** (9 platform cards, each with a
  live metric) · **FeaturedPortfolio** · **FeaturedPlan** (Proptech program) ·
  **EnterpriseAxes** (3 segments) · **Impact** (aspiration vs. actual) · **FinalCta**.
  Charts reuse the dependency-free SVG `dash/charts` (`AreaLine`, `Donut`) — no
  Recharts dependency added.
- **Aspiration vs actual** (SPEC §7): MIT-inspired targets are labelled "Aspiration ·
  MIT model" and kept out of the live numbers; actuals are pulled live and sourced —
  never fabricated.

> Status: SPEC_HOMEPAGE.md Phases 0–3 implemented (aggregation reads in-memory libs
> directly instead of HTTP + server cache; realtime via 20s polling instead of SSE).
> The previous fi.co-style section components under `src/components/sections/` are no
> longer wired into `/` (kept for reference). Optional: SSE stream + admin-editable
> HomeContent (Phase 4).

## RAI Platform (`/platform`) — global software catalog

A G2/Capterra-style **catalog of every platform & software** (external + RAI's
own), in the **Solutions** menu. Hierarchical taxonomy, multi-facet filtering,
structured reviews, side-by-side compare, community submissions, and an **AI
ingestion pipeline**. Compliance-first (SPEC §9): only factual public metadata,
RAI's own neutral descriptions (never verbatim copy), provenance on every record,
nothing fabricated.

- **Data** `src/lib/platform.ts` (server-safe): hierarchical `categories` (products
  attach only to leaf), `Platform` (facets: pricing, deployment, platform type,
  open-source, company size, industry, region, source), 16 seed platforms incl. 4
  **RAI platforms** (badge + links to /apps · /code · /mcp · /pricing). `listPlatforms`
  (facets + full-text + sort + pagination), `categoryTree`.
- **Catalog** `/platform` — `PlatformCatalog` (facet sidebar, search, sort,
  pagination, RAI/OSS badges, compare bar). **Detail** `/platform/[slug]` —
  `PlatformDetail` tabs: Overview · Use cases · Pricing · Reviews · Alternatives ·
  **Sources (provenance)**. **Compare** `/platform/compare?ids=` (≤4 side-by-side).
  **Submit** `/platform/submit` (community → review queue). SSG for seed slugs;
  store-approved records render client-side.
- **API** `/api/platform/v0/*` (`force-dynamic`): `platforms` (list+facets),
  `platforms/[slug]`, `categories`, `ai/ingest`.
- **Store** `src/lib/platform-store.ts` (localStorage): community **reviews**
  (build ratingAvg/reviewCount live), **submissions**, **AI ingestion queue**,
  **ingestion sources** (allowed flag), approved/published records.
- **AI ingestion** `src/lib/platform-ai.ts` (server): normalizes factual metadata
  from **allowed** sources into the RAI schema, **rewrites descriptions** in RAI's
  voice (Anthropic `claude-sonnet-4-6` when keyed, else template), **dedupes** by
  domain/name (→ `merge_dedup`), attaches **provenance + confidence**, and queues
  `IngestionSuggestion`s. Guardrails block fabricated numbers; **never auto-publishes**.
- **Admin CMS** `/admin/platform`: **Submissions** (approve/reject → publish),
  **AI ingestion** (run pipeline + review queue with provenance/confidence/diff),
  **Sources** (toggle `allowed`; only vetted sources run).

> Status: SPEC_PLATFORM.md Phases 0–4 implemented (in-memory seed + Next route handlers +
> client store; ingestion reads a small built-in allowed dataset instead of live
> connectors). Production: PostgreSQL + full-text search + real licensed source
> connectors + scheduler; legal review of every source before `allowed`.

## Notes

- All copy is bilingual `{ en, vi }` in `content.ts` / `dashboard.ts` — swap for a CMS/DB
  without touching components.
- Product count is **35** (per the guideline product list).
- Lead form posts to `/api/lead` (stub) — wire to Resend/HubSpot/DB for real capture.
