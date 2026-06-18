"use client";

import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { useCurrentOrg } from "@/lib/workspace-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";
const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function BillingPage() {
  const { tr } = useLang();
  const org = useCurrentOrg();

  return (
    <div className={`${WRAP} py-8`}>
      <div className="label mb-2 text-accent">{tr(t("Venture Builder", "Trình tạo doanh nghiệp"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Billing & credits", "Thanh toán & credit"))}</h1>
      <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">
        {tr(
          t(
            "Ventures and engines draw from your organization's VND credit balance.",
            "Doanh nghiệp và engine trừ vào số dư credit VND của tổ chức."
          )
        )}
      </p>

      <div className="mt-6 border border-border bg-surface p-6">
        <div className="flex items-center gap-2 text-text-2">
          <Icon name="coins" size={16} className="text-accent" />
          <span className="label">{tr(t("Current balance", "Số dư hiện tại"))}</span>
        </div>
        <div className="mono mt-2 text-[2.4rem] font-medium tracking-tight text-text">{fmtVnd(org?.balanceVnd ?? 0)}</div>
        <div className="mt-1 text-[0.82rem] text-text-2">{org?.name}</div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button disabled className={buttonClass("primary", "md")}>
            <Icon name="receipt" size={16} />
            {tr(t("Top up", "Nạp thêm"))}
          </button>
          <span className="mono text-[0.72rem] text-text-2">{tr(t("Coming soon", "Sắp có"))}</span>
        </div>
      </div>

      <div className="mt-4 border border-border bg-bg p-4">
        <p className="text-[0.85rem] text-text-2">
          {tr(
            t(
              "Top-ups and VAT e-invoices are handled through the RAI LLMs gateway billing. Credits are shared across LLMs, Big Data and the Venture Builder engines.",
              "Nạp tiền và hóa đơn VAT điện tử được xử lý qua phần thanh toán của cổng RAI LLMs. Credit dùng chung cho LLMs, Big Data và các engine của Trình tạo doanh nghiệp."
            )
          )}
        </p>
      </div>
    </div>
  );
}
