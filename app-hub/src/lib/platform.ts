// Platform detection per docs/rai-app-hub-spec.md §2.2.
// arch (arm64 vs x64) is unreliable from UA → user picks on /downloads.

export type DownloadKind =
  | "ios-appstore"
  | "android-play"
  | "desktop-mac"
  | "desktop-win"
  | "desktop-linux"
  | "pwa";

export type Detected = { os: string; browser: string; arch?: string; suggested: DownloadKind };

export function detectPlatform(): Detected {
  if (typeof navigator === "undefined") return { os: "unknown", browser: "unknown", suggested: "pwa" };
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMac = /Macintosh/.test(ua) && !isIOS;
  const isWin = /Windows/.test(ua);
  const isLinux = /Linux/.test(ua) && !isAndroid;

  const browser = detectBrowser(ua);

  let os = "unknown";
  let suggested: DownloadKind = "pwa";
  if (isIOS) { os = "iOS"; suggested = "ios-appstore"; }
  else if (isAndroid) { os = "Android"; suggested = "android-play"; }
  else if (isMac) { os = "macOS"; suggested = "desktop-mac"; }
  else if (isWin) { os = "Windows"; suggested = "desktop-win"; }
  else if (isLinux) { os = "Linux"; suggested = "desktop-linux"; }

  // Firefox desktop cannot install PWAs via manifest → keep the native suggestion.
  return { os, browser, suggested };
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Trình duyệt";
}

export const KIND_LABEL: Record<DownloadKind, string> = {
  "ios-appstore": "Cài trên iPhone",
  "android-play": "Tải trên Google Play",
  "desktop-mac": "Tải cho macOS",
  "desktop-win": "Tải cho Windows",
  "desktop-linux": "Tải cho Linux",
  pwa: "Cài bằng trình duyệt",
};
