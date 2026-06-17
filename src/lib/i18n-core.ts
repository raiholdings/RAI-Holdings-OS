/** Server-safe i18n primitives (no React, no "use client"). */

export type Lang = "en" | "vi";

/** A bilingual string. */
export type T = { en: string; vi: string };

export const t = (en: string, vi: string): T => ({ en, vi });
