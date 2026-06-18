// Big Data — company dataset synced from raicrm.vn (Perfex CRM REST API).
// Pure types + mappers (no secrets). The authenticated fetch lives in the
// server route /api/bigdata/v0/* so the CRM token never reaches the browser.

/** Raw Perfex customer (only the fields we use). */
export type PerfexCustomer = {
  userid: string;
  company?: string;
  firstname?: string;
  lastname?: string;
  vat?: string;
  phonenumber?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  billing_city?: string;
  billing_state?: string;
  datecreated?: string;
  active?: string | number;
  custom_fields?: { label?: string; value?: string }[];
};

/** Cleaned shape used by the UI. */
export type Company = {
  id: string;
  name: string;
  taxCode: string;
  region: string;
  address: string;
  phone: string;
  website: string;
  active: boolean;
  addedAt: string;
};

export type CompanySearchResult = {
  data: Company[];
  total: number; // total matches before pagination
  page: number;
  perPage: number;
  source: string;
  error?: string; // upstream problem (UI shows a friendly note, never crashes)
  note?: string; // e.g. "query too short"
};

/** Pull a province/region from the messy Vietnamese address tail. */
export function regionFromAddress(c: PerfexCustomer): string {
  const addr = (c.address || "").trim();
  if (addr) {
    const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
    // drop a trailing "Việt Nam"
    const last = parts[parts.length - 1]?.toLowerCase() === "việt nam" ? parts[parts.length - 2] : parts[parts.length - 1];
    if (last) return last;
  }
  return c.billing_city || c.state || c.city || "—";
}

export function mapCustomer(c: PerfexCustomer): Company {
  const name = (c.company || `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim()) || "—";
  return {
    id: String(c.userid),
    name,
    taxCode: c.vat || "—",
    region: regionFromAddress(c),
    address: c.address || "—",
    phone: c.phonenumber || "",
    website: c.website || "",
    active: String(c.active) === "1",
    addedAt: c.datecreated || "",
  };
}
