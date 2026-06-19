import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { detectPlatform, KIND_LABEL, type Detected } from "../lib/platform";
import { loadReleases, type Releases } from "../lib/releases";

/** Resolve the suggested download into a label + href from releases.json. */
function resolve(d: Detected, r: Releases): { label: string; href: string; external: boolean } {
  const p = r.platforms;
  switch (d.suggested) {
    case "desktop-mac": return { label: KIND_LABEL["desktop-mac"], href: p.macos?.universal?.url ?? "/downloads", external: !!p.macos };
    case "desktop-win": return { label: KIND_LABEL["desktop-win"], href: p.windows?.x64?.url ?? "/downloads", external: !!p.windows };
    case "desktop-linux": return { label: KIND_LABEL["desktop-linux"], href: p.linux?.["x64-appimage"]?.url ?? "/downloads", external: !!p.linux };
    case "ios-appstore": return { label: KIND_LABEL["ios-appstore"], href: p.ios?.store_url ?? "/downloads", external: !!p.ios?.store_url };
    case "android-play": return { label: KIND_LABEL["android-play"], href: p.android?.store_url ?? "/downloads", external: !!p.android?.store_url };
    default: return { label: KIND_LABEL.pwa, href: "/downloads", external: false };
  }
}

export function SmartDownload() {
  const [d, setD] = useState<Detected | null>(null);
  const [r, setR] = useState<Releases | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setD(detectPlatform());
    loadReleases().then(setR).catch(() => setErr(true));
  }, []);

  const ready = d && r;
  const pick = ready ? resolve(d, r) : null;

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="flex flex-wrap items-center gap-3">
        {pick ? (
          pick.external ? (
            <a href={pick.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4f8ff7] to-[#7c5cff] px-6 py-3.5 text-[1rem] font-semibold text-white shadow-lg shadow-[#4f8ff7]/20 transition-transform hover:scale-[1.02]">
              ↓ {pick.label}
            </a>
          ) : (
            <Link to={pick.href} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4f8ff7] to-[#7c5cff] px-6 py-3.5 text-[1rem] font-semibold text-white shadow-lg shadow-[#4f8ff7]/20 transition-transform hover:scale-[1.02]">
              ↓ {pick.label}
            </Link>
          )
        ) : (
          <span className="inline-flex items-center rounded-xl bg-[#12141c] px-6 py-3.5 text-[1rem] text-[#9aa3b7]">{err ? "Xem bản tải →" : "Đang nhận diện thiết bị…"}</span>
        )}
        <Link to="/downloads" className="rounded-xl border border-[#2c3146] px-5 py-3.5 text-[0.95rem] text-white transition-colors hover:border-[#4f8ff7]">
          Xem mọi nền tảng
        </Link>
      </div>
      <div className="text-[0.82rem] text-[#9aa3b7]">
        {d ? <>Phát hiện: <span className="text-white">{d.os}</span> · {d.browser}{r ? <> · phiên bản {r.version}</> : null}</> : "…"}
        {" · "}
        <a href="https://workspace.raiholdings.vn" className="text-[#4f8ff7] hover:underline">Dùng ngay trên web</a>
      </div>
    </div>
  );
}
