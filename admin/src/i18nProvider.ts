import type { I18nProvider } from "@refinedev/core";

// Lightweight vi/en i18n (no extra deps). Swap to react-i18next later if needed.
const dict: Record<string, Record<string, string>> = {
  vi: {
    "pages.login.title": "Đăng nhập RAI Admin",
    "buttons.save": "Lưu",
    "buttons.create": "Tạo mới",
    "buttons.edit": "Sửa",
    "buttons.delete": "Xóa",
    "iam.organizations": "Tổ chức",
    "iam.roles": "Vai trò",
    "iam.memberships": "Thành viên",
  },
  en: {
    "pages.login.title": "Sign in to RAI Admin",
    "buttons.save": "Save",
    "buttons.create": "Create",
    "buttons.edit": "Edit",
    "buttons.delete": "Delete",
    "iam.organizations": "Organizations",
    "iam.roles": "Roles",
    "iam.memberships": "Memberships",
  },
};

let locale = (typeof localStorage !== "undefined" && localStorage.getItem("rai-admin-lang")) || "vi";

export const i18nProvider: I18nProvider = {
  translate: (key: string, options?: any, defaultMessage?: string) =>
    dict[locale]?.[key] ?? (typeof options === "string" ? options : defaultMessage) ?? key,
  changeLocale: (lang: string) => {
    locale = lang;
    try { localStorage.setItem("rai-admin-lang", lang); } catch {}
    window.location.reload();
    return Promise.resolve();
  },
  getLocale: () => locale,
};
