import { useEffect, useState } from "react";
import { loadReleases, type Releases as R } from "../lib/releases";

export function Releases() {
  const [r, setR] = useState<R | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { loadReleases().then(setR).catch(() => setErr(true)); }, []);

  if (err) return <div className="mx-auto max-w-3xl px-5 py-16 text-[#9aa3b7]">Không tải được changelog.</div>;
  if (!r) return <div className="mx-auto max-w-3xl px-5 py-16 text-[#9aa3b7]">Đang tải…</div>;

  const log = r.changelog ?? [];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-semibold tracking-tight">Phiên bản & cập nhật</h1>
      <p className="mt-2 text-[#9aa3b7]">Lịch sử phát hành RAI OS. Phiên bản hiện tại: <span className="text-white">{r.version}</span>.</p>

      <div className="mt-10 flex flex-col gap-8">
        {log.map((e, i) => (
          <div key={e.version} className="relative border-l border-[#232735] pl-6">
            <span className={`absolute -left-[6.5px] top-1.5 size-3 rounded-full ${i === 0 ? "bg-[#4f8ff7]" : "bg-[#2c3146]"}`} />
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold">v{e.version}</h2>
              {i === 0 ? <span className="rounded-full bg-[#4f8ff7]/15 px-2 py-0.5 text-[0.68rem] text-[#7fb0ff]">Mới nhất</span> : null}
              <span className="text-[0.82rem] text-[#9aa3b7]">{e.released_at}</span>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 text-[0.92rem] text-[#9aa3b7]">
              {e.notes.map((n, k) => <li key={k} className="flex gap-2"><span className="text-[#4f8ff7]">•</span>{n}</li>)}
            </ul>
          </div>
        ))}
        {log.length === 0 ? <p className="text-[#9aa3b7]">Chưa có changelog.</p> : null}
      </div>
    </div>
  );
}
