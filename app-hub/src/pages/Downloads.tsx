import { useEffect, useState, type ReactNode } from "react";
import { loadReleases, type Releases, type Artifact, type StoreEntry } from "../lib/releases";
import { detectPlatform, type Detected } from "../lib/platform";

const ARCH_LABEL: Record<string, string> = {
  x64: "64-bit (x64)", arm64: "ARM64", universal: "Universal (Intel + Apple Silicon)",
  "x64-appimage": ".AppImage (x64)", "x64-deb": ".deb (x64)", "arm64-appimage": ".AppImage (arm64)",
};

function dl(label: string, a: Artifact) {
  return (
    <a key={label} href={a.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-[#232735] bg-[#0a0b10] px-3.5 py-2.5 text-[0.88rem] transition-colors hover:border-[#4f8ff7]">
      <span>↓ {ARCH_LABEL[label] ?? label}</span>
      {a.size ? <span className="text-[0.78rem] text-[#9aa3b7]">{a.size}</span> : null}
    </a>
  );
}

function storeBtn(label: string, url?: string) {
  if (!url) return <span className="text-[0.82rem] text-[#9aa3b7]">Sắp có</span>;
  return <a href={url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg border border-[#232735] bg-[#0a0b10] px-3.5 py-2.5 text-[0.88rem] transition-colors hover:border-[#4f8ff7]">{label} →</a>;
}

function Card({ icon, title, req, highlight, children }: { icon: string; title: string; req?: string; highlight?: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border bg-[#12141c] p-5 ${highlight ? "border-[#4f8ff7]" : "border-[#232735]"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div><h3 className="text-[1.02rem] font-semibold">{title}</h3>{req ? <div className="text-[0.76rem] text-[#9aa3b7]">{req}</div> : null}</div>
        {highlight ? <span className="ml-auto rounded-full bg-[#4f8ff7]/15 px-2 py-0.5 text-[0.68rem] text-[#7fb0ff]">Đề xuất cho bạn</span> : null}
      </div>
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function Downloads() {
  const [r, setR] = useState<Releases | null>(null);
  const [d, setD] = useState<Detected | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { setD(detectPlatform()); loadReleases().then(setR).catch(() => setErr(true)); }, []);

  if (err) return <div className="mx-auto max-w-6xl px-5 py-16 text-[#9aa3b7]">Không tải được danh sách phiên bản.</div>;
  if (!r) return <div className="mx-auto max-w-6xl px-5 py-16 text-[#9aa3b7]">Đang tải…</div>;

  const p = r.platforms;
  const os = d?.os;
  const ext = (e: StoreEntry | undefined, name: string, recom = false) => <Card key={name} icon="🧩" title={name} highlight={recom}>{storeBtn(`Mở ${name}`, e?.store_url)}</Card>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-semibold tracking-tight">Tải RAI OS</h1>
      <p className="mt-2 text-[#9aa3b7]">Phiên bản {r.version} · phát hành {r.released_at}. Chọn nền tảng phù hợp với thiết bị của bạn.</p>

      {/* Desktop */}
      <h2 className="mt-10 mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-[#9aa3b7]">Máy tính</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {p.windows && <Card icon="🪟" title="Windows" req="Windows 10/11" highlight={os === "Windows"}>{Object.entries(p.windows).map(([k, a]) => dl(k, a))}</Card>}
        {p.macos && <Card icon="🍎" title="macOS" req="macOS 12+" highlight={os === "macOS"}>{Object.entries(p.macos).map(([k, a]) => dl(k, a))}</Card>}
        {p.linux && <Card icon="🐧" title="Linux" req="x64" highlight={os === "Linux"}>{Object.entries(p.linux).map(([k, a]) => dl(k, a))}</Card>}
      </div>

      {/* Mobile */}
      <h2 className="mt-10 mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-[#9aa3b7]">Điện thoại</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card icon="" title="iOS" req="iPhoneiPad · iOS 16.4+" highlight={os === "iOS"}>
          {storeBtn("App Store", p.ios?.store_url)}
          <div className="text-[0.78rem] text-[#9aa3b7]">Hoặc cài PWA: Safari → Chia sẻ → Thêm vào MH chính.</div>
        </Card>
        <Card icon="🤖" title="Android" req="Android 8+" highlight={os === "Android"}>
          {storeBtn("Google Play", p.android?.store_url)}
          {p.android?.apk_url ? dl("APK trực tiếp", { url: p.android.apk_url }) : null}
        </Card>
      </div>

      {/* Extension */}
      <h2 className="mt-10 mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-[#9aa3b7]">Tiện ích trình duyệt</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ext(p.chrome, "Chrome", d?.browser === "Chrome")}
        {ext(p.edge, "Edge", d?.browser === "Edge")}
        {ext(p.firefox, "Firefox", d?.browser === "Firefox")}
        {ext(p.safari, "Safari", d?.browser === "Safari")}
      </div>

      {/* PWA */}
      <h2 id="pwa" className="mt-10 mb-3 scroll-mt-20 text-[0.8rem] font-semibold uppercase tracking-wider text-[#9aa3b7]">Cài trực tiếp (PWA)</h2>
      <div className="rounded-2xl border border-[#232735] bg-[#12141c] p-5">
        <p className="text-[0.92rem] text-[#9aa3b7]">Mở <a href="https://workspace.raiholdings.vn" className="text-[#4f8ff7] hover:underline">workspace.raiholdings.vn</a> rồi cài như ứng dụng — không cần qua cửa hàng:</p>
        <ul className="mt-3 grid gap-2 text-[0.88rem] text-[#9aa3b7] sm:grid-cols-2">
          <li>• <b className="text-white">Chrome/Edge (máy tính):</b> nhấn nút Cài trên thanh địa chỉ.</li>
          <li>• <b className="text-white">iPhone (Safari):</b> Chia sẻ → Thêm vào Màn hình chính.</li>
          <li>• <b className="text-white">Android (Chrome):</b> menu ⋮ → Cài ứng dụng.</li>
          <li>• <b className="text-white">Firefox máy tính:</b> chưa hỗ trợ cài PWA — dùng bản desktop hoặc trên web.</li>
        </ul>
      </div>
    </div>
  );
}
