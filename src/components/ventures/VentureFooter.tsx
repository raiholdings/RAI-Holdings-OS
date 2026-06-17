"use client";

import { useLang, t } from "@/lib/i18n";

const RAI = "https://raiholdings.vn";

export function VentureFooter() {
  const { tr } = useLang();
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[0.82rem] text-text-2">
          {tr(t("A venture in the RAI Holdings ecosystem.", "Một venture trong hệ sinh thái RAI Holdings."))}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[0.82rem]">
          <a href={RAI} className="text-text-2 transition-colors hover:text-text">{tr(t("About RAI", "Về RAI Holdings"))}</a>
          <a href={`${RAI}/about/contact`} className="text-text-2 transition-colors hover:text-text">{tr(t("Contact", "Liên hệ"))}</a>
          <span className="mono text-text-2">© RAI Holdings</span>
        </div>
      </div>
    </footer>
  );
}
