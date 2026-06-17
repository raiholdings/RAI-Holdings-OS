"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fetchRepo } from "@/lib/code-client";
import { getLicense, categoryColor, categoryLabels, licenseCompatible, licenses, type Repo } from "@/lib/code";
import { useRepo, writeFile, setLicense, deploy, rollback, addDomain, verifyDomain, type UserRepo } from "@/lib/code-store";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type Tab = "code" | "issues" | "prs" | "deploy" | "license";

export default function RepoDetail() {
  const { tr } = useLang();
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const slug = `${owner}/${repo}`;
  const stored = useRepo(slug);
  const [seed, setSeed] = useState<Repo | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [tab, setTab] = useState<Tab>("code");

  useEffect(() => {
    if (stored) { setState("ok"); return; }
    fetchRepo(owner, repo).then((r) => { if (r) { setSeed(r); setState("ok"); } else setState("missing"); });
  }, [owner, repo, stored]);

  const data = (stored ?? seed) as UserRepo | Repo | null;
  const editable = !!stored;

  if (state === "loading") return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Loading…", "Đang tải…"))}</p></Wrap>;
  if (!data) return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Repository not found.", "Không tìm thấy kho mã."))} <Link href="/code" className="font-medium text-accent">← {tr(t("Repositories", "Kho mã"))}</Link></p></Wrap>;

  const lic = getLicense(data.licenseSpdx);
  const tabs: { id: Tab; label: T }[] = [
    { id: "code", label: t("Code", "Mã") }, { id: "issues", label: t("Issues", "Issues") }, { id: "prs", label: t("Pull requests", "PR") }, { id: "deploy", label: t("Deploy", "Triển khai") }, { id: "license", label: t("License", "Giấy phép") },
  ];

  return (
    <Wrap>
      <Link href="/code" className="mono text-[0.74rem] text-text-2 hover:text-text">← {tr(t("Repositories", "Kho mã"))}</Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,3vw,2rem)] font-medium text-text"><span className="text-text-2">{data.owner}/</span>{data.name}</h1>
          <p className="mt-1 text-[0.95rem] text-text-2">{tr(data.description)}</p>
          <div className="mono mt-2 flex flex-wrap items-center gap-3 text-[0.72rem] text-text-2">
            <span>★ {data.starCount}</span><span>⑂ {data.forkCount}</span>
            {lic && <span className="rounded-[var(--radius-sm)] px-1.5 py-0.5" style={{ color: categoryColor[lic.category], background: `color-mix(in srgb, ${categoryColor[lic.category]} 12%, transparent)` }}>{data.licenseSpdx}</span>}
            {data.deployUrl && <a href={data.deployUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent">🌐 {data.deployUrl.replace("https://", "")}</a>}
            {data.sourceOrigin !== "created" && data.upstreamRef && <span>{tr(t("from", "từ"))} {data.upstreamRef.url}</span>}
          </div>
        </div>
        <button onClick={() => setTab("deploy")} className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.86rem] font-medium text-white">{tr(t("Deploy", "Triển khai"))} ▸</button>
      </header>

      {!editable && <p className="mono mt-4 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-[0.74rem] text-text-2">{tr(t("Seed repo (read-only). Create your own repo to edit, deploy, and add domains.", "Repo mẫu (chỉ đọc). Tạo kho mã của bạn để sửa, triển khai và gắn tên miền."))}</p>}

      <nav className="mt-5 flex gap-1 border-b border-border">
        {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("relative px-3 py-2.5 text-[0.86rem] transition-colors", tab === tb.id ? "text-text" : "text-text-2 hover:text-text")}>{tr(tb.label)}{tab === tb.id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />}</button>)}
      </nav>

      <div className="mt-6">
        {tab === "code" && <CodeTab repo={data} slug={slug} editable={editable} />}
        {tab === "issues" && <EmptyTab title={tr(t("Issues", "Issues"))} sample={tr(t("#12 · Map pins overlap on mobile", "#12 · Pin bản đồ chồng nhau trên mobile"))} />}
        {tab === "prs" && <EmptyTab title={tr(t("Pull requests", "Yêu cầu hợp nhất"))} sample={tr(t("#7 · Add dark mode (preview deployed)", "#7 · Thêm dark mode (đã deploy preview)"))} />}
        {tab === "deploy" && <DeployTab repo={data} slug={slug} editable={editable} />}
        {tab === "license" && <LicenseTab repo={data} slug={slug} editable={editable} />}
      </div>
    </Wrap>
  );
}

/* ----------------------------- Code tab --------------------------------- */
function CodeTab({ repo, slug, editable }: { repo: Repo; slug: string; editable: boolean }) {
  const { tr } = useLang();
  const paths = Object.keys(repo.files).sort();
  const [sel, setSel] = useState(paths.find((p) => p === "README.md") ?? paths[0]);
  const [draft, setDraft] = useState(repo.files[sel] ?? "");
  const [msg, setMsg] = useState("");
  const dirty = draft !== (repo.files[sel] ?? "");

  useEffect(() => { setDraft(repo.files[sel] ?? ""); setMsg(""); }, [sel, repo.files]);

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <aside className="rounded-[var(--radius-lg)] border border-border bg-surface p-2 h-max">
        <div className="mono mb-2 px-2 py-1 text-[0.7rem] text-text-2">main</div>
        {paths.map((p) => (
          <button key={p} onClick={() => setSel(p)} className={cn("mono flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[0.76rem] transition-colors", sel === p ? "bg-bg text-text" : "text-text-2 hover:bg-bg")}>
            <Icon name={p.includes("/") ? "file-text" : "file-text"} size={12} /> {p}
          </button>
        ))}
      </aside>
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="mono text-[0.78rem] text-text">{sel}</span>
          {editable && dirty && <span className="mono text-[0.7rem]" style={{ color: "var(--color-warn)" }}>● {tr(t("unsaved", "chưa lưu"))}</span>}
        </div>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} readOnly={!editable} spellCheck={false}
          className="mono block h-[360px] w-full resize-none bg-transparent p-4 text-[0.78rem] leading-relaxed text-text outline-none" />
        {editable && (
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={tr(t("Commit message…", "Nội dung commit…"))} className="flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.82rem] text-text outline-none focus:border-accent" />
            <button disabled={!dirty} onClick={() => writeFile(slug, sel, draft, msg)} className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.82rem] font-medium text-white disabled:opacity-50">{tr(t("Commit", "Commit"))}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Deploy tab ------------------------------- */
function DeployTab({ repo, slug, editable }: { repo: Repo; slug: string; editable: boolean }) {
  const { tr } = useLang();
  const r = repo as UserRepo;
  const [cfg, setCfg] = useState({ buildCommand: "npm run build", outputDir: "dist", runtime: "static" as "static" | "node" | "container" });
  const [host, setHost] = useState("");
  const latest = r.deployments?.[0];

  if (!editable) return <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-[0.9rem] text-text-2">{repo.deployUrl ? <>🌐 {tr(t("Managed deployment:", "Triển khai sẵn:"))} <a href={repo.deployUrl} className="text-accent">{repo.deployUrl}</a></> : tr(t("No deployment.", "Chưa triển khai."))}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <span className="label text-text-2">{tr(t("Build configuration", "Cấu hình build"))}</span>
        <div className="mt-3 grid gap-3">
          <Field label={tr(t("Install + build command", "Lệnh build"))}><input className={inp} value={cfg.buildCommand} onChange={(e) => setCfg({ ...cfg, buildCommand: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr(t("Output dir", "Thư mục output"))}><input className={inp} value={cfg.outputDir} onChange={(e) => setCfg({ ...cfg, outputDir: e.target.value })} /></Field>
            <Field label={tr(t("Runtime", "Runtime"))}><select className={inp} value={cfg.runtime} onChange={(e) => setCfg({ ...cfg, runtime: e.target.value as typeof cfg.runtime })}><option value="static">static</option><option value="node">node</option><option value="container">container</option></select></Field>
          </div>
          <button onClick={() => deploy(slug, cfg)} className="rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-[0.86rem] font-medium text-white">{tr(t("Deploy", "Triển khai"))}</button>
        </div>
        {latest && (
          <div className="mt-4">
            <div className="mono mb-1 flex items-center justify-between text-[0.72rem] text-text-2"><span>{tr(t("Build log", "Log build"))}</span><span style={{ color: latest.status === "ready" ? "var(--color-ok)" : "var(--color-warn)" }}>{latest.status}</span></div>
            <pre className="mono max-h-40 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.72rem] text-text">{latest.logs.join("\n")}</pre>
          </div>
        )}
      </section>

      <div className="grid gap-4">
        <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <span className="label text-text-2">{tr(t("Deployments", "Các bản triển khai"))}</span>
          <div className="mt-3 grid gap-2">
            {(r.deployments?.length ?? 0) === 0 ? <p className="text-[0.82rem] text-text-2">{tr(t("No deployments yet.", "Chưa có bản triển khai."))}</p> : r.deployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-bg p-2.5">
                <span className="mono min-w-0 truncate text-[0.74rem] text-text">{d.url?.replace("https://", "")}</span>
                <span className="flex flex-none items-center gap-2">
                  {d.active && <span className="mono text-[0.62rem] uppercase" style={{ color: "var(--color-ok)" }}>active</span>}
                  <span className="mono text-[0.66rem] text-text-2">{d.status}</span>
                  {!d.active && d.status === "ready" && <button onClick={() => rollback(slug, d.id)} className="rounded-[var(--radius-sm)] border border-border-strong px-2 py-0.5 text-[0.68rem] text-text">{tr(t("rollback", "rollback"))}</button>}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <span className="label text-text-2">{tr(t("Custom domains", "Tên miền"))}</span>
          <div className="mt-3 flex gap-2">
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="app.example.com" className={cn(inp, "font-[family-name:var(--font-mono)]")} />
            <button disabled={!host.trim()} onClick={() => { addDomain(slug, host.trim()); setHost(""); }} className="rounded-[var(--radius-md)] bg-accent px-3 py-2 text-[0.82rem] font-medium text-white disabled:opacity-50">{tr(t("Add", "Thêm"))}</button>
          </div>
          <div className="mt-3 grid gap-2">
            {r.domains?.map((d) => (
              <div key={d.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div className="flex items-center justify-between"><span className="mono text-[0.78rem] text-text">{d.hostname}</span><span className="mono text-[0.66rem]" style={{ color: d.verified ? "var(--color-ok)" : "var(--color-warn)" }}>{d.verified ? `SSL ${d.sslStatus}` : tr(t("unverified", "chưa xác minh"))}</span></div>
                {!d.verified && <>
                  <p className="mono mt-2 text-[0.7rem] text-text-2">{tr(t("Create DNS record", "Tạo bản ghi DNS"))}: {d.verifyMethod} {d.hostname} → {d.dnsTarget}</p>
                  <button onClick={() => verifyDomain(slug, d.id)} className="mt-2 rounded-[var(--radius-sm)] border border-border-strong px-2.5 py-1 text-[0.72rem] text-text">{tr(t("Verify DNS & issue SSL", "Xác minh DNS & cấp SSL"))}</button>
                </>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------------- License tab ------------------------------ */
function LicenseTab({ repo, slug, editable }: { repo: Repo; slug: string; editable: boolean }) {
  const { tr } = useLang();
  const lic = getLicense(repo.licenseSpdx);
  const upstream = (repo as UserRepo).upstreamRef?.license;
  const [target, setTarget] = useState(repo.licenseSpdx);
  const compat = upstream ? licenseCompatible(upstream, target) : { ok: true };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <span className="label text-text-2">{tr(t("Current license", "Giấy phép hiện tại"))}</span>
        {lic && <>
          <div className="mt-2 flex items-center gap-2"><span className="mono text-[1rem] font-medium" style={{ color: categoryColor[lic.category] }}>{lic.spdxId}</span><span className="mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.62rem]" style={{ color: categoryColor[lic.category], background: `color-mix(in srgb, ${categoryColor[lic.category]} 12%, transparent)` }}>{tr(categoryLabels[lic.category])}</span></div>
          <p className="mt-2 text-[0.88rem] text-text-2">{tr(lic.blurb)}</p>
          <div className="mono mt-3 grid gap-1 text-[0.74rem]">
            <span style={{ color: "var(--color-ok)" }}>✓ {lic.permissions.join(", ")}</span>
            {lic.conditions.length > 0 && <span style={{ color: "var(--color-warn)" }}>⚠ {lic.conditions.join(", ")}</span>}
            {lic.limitations.length > 0 && <span style={{ color: "var(--color-err)" }}>✗ {lic.limitations.join(", ")}</span>}
          </div>
        </>}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <span className="label text-text-2">{tr(t("Change license", "Đổi giấy phép"))}</span>
        {upstream && <p className="mono mt-2 text-[0.72rem] text-text-2">{tr(t("Upstream", "Nguồn"))}: {upstream}</p>}
        <select disabled={!editable} className={cn(inp, "mt-3")} value={target} onChange={(e) => setTarget(e.target.value)}>{licenses.map((l) => <option key={l.spdxId} value={l.spdxId}>{l.spdxId}</option>)}</select>
        {!compat.ok && compat.reason && <p className="mt-3 rounded-[var(--radius-md)] border p-3 text-[0.78rem]" style={{ borderColor: "var(--color-err)", color: "var(--color-err)", background: "color-mix(in srgb, var(--color-err) 8%, transparent)" }}>⚠ {tr(compat.reason)}</p>}
        {editable && <button disabled={!compat.ok || target === repo.licenseSpdx} onClick={() => setLicense(slug, target)} className="mt-3 rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-[0.86rem] font-medium text-white disabled:opacity-50">{tr(t("Apply license", "Áp dụng"))}</button>}
        {!editable && <p className="mt-3 text-[0.78rem] text-text-2">{tr(t("Read-only seed repo.", "Repo mẫu chỉ đọc."))}</p>}
      </section>
    </div>
  );
}

/* ----------------------------- shared ----------------------------------- */
function Wrap({ children }: { children: React.ReactNode }) { return <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8">{children}</main>; }
function EmptyTab({ title, sample }: { title: string; sample: string }) {
  return <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6"><span className="label text-text-2">{title}</span><div className="mt-3 rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.84rem] text-text-2">{sample}</div></div>;
}
const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.86rem] text-text outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[0.76rem] font-medium text-text-2">{label}</span>{children}</label>; }
