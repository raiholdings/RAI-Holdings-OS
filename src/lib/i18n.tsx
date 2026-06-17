"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type Lang, type T, t } from "@/lib/i18n-core";

// Re-export the server-safe primitives so existing imports keep working.
export { t };
export type { Lang, T };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; toggle: () => void; tr: (s: T) => string };

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("rai-lang")) as Lang | null;
    if (saved === "en" || saved === "vi") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("rai-lang", l);
    } catch {}
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "vi" : "en"), [lang, setLang]);
  const tr = useCallback((s: T) => s[lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, toggle, tr }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
