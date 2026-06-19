"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLang, t } from "@/lib/i18n";

type BIPEvent = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

/** Registers the service worker and offers a "Cài RAI OS" install button.
 *  Chromium → native prompt (beforeinstallprompt). iOS → Share-sheet instructions. */
export function InstallApp() {
  const { tr } = useLang();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(true); // hide until we know it's installable
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setInstalled(standalone);
    if (!standalone && isIOS) setInstalled(false);

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); setInstalled(false); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onBIP); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (installed && !deferred) return null;

  async function install() {
    if (!deferred) { setIosHint((v) => !v); return; }
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
  }

  // No native prompt + not iOS (e.g. Firefox / already dismissed) → don't show.
  if (!deferred && !isIOS) return null;

  return (
    <div className="relative">
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-[0.8rem] font-medium text-accent transition-colors hover:bg-accent/15"
      >
        <Icon name="arrow-up-right" size={14} className="rotate-[135deg]" />
        {tr(t("Install RAI OS", "Cài RAI OS"))}
      </button>
      {iosHint && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[var(--radius-md)] border border-border bg-surface p-3 text-[0.8rem] text-text-2 shadow-lg">
          {tr(t(
            "On iPhone/iPad: tap Share → Add to Home Screen to install RAI OS.",
            "Trên iPhone/iPad: bấm Chia sẻ → Thêm vào Màn hình chính để cài RAI OS."
          ))}
        </div>
      )}
    </div>
  );
}
