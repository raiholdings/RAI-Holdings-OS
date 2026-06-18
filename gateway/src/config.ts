// Centralized env config. Fails fast on missing critical values in production.
const env = process.env;

function req(name: string, fallback?: string): string {
  const v = env[name] ?? fallback;
  if (v === undefined || v === "") {
    if (env.NODE_ENV === "production") throw new Error(`Missing required env ${name}`);
    return "";
  }
  return v;
}

export const config = {
  port: parseInt(env.PORT || "8080", 10),
  isProd: env.NODE_ENV === "production",
  databaseUrl: req("DATABASE_URL", "postgres://rai:rai@localhost:5432/rai_llms"),
  redisUrl: env.REDIS_URL || "",
  encryptionKey: req("ENCRYPTION_KEY", "0".repeat(64)),
  adminToken: req("ADMIN_TOKEN", "dev-admin"),
  fxUsdVnd: parseInt(env.FX_USD_VND || "25400", 10),
  defaultMarkupPercent: parseFloat(env.DEFAULT_MARKUP_PERCENT || "20"),
  // bootstrap upstream keys (prod: use encrypted provider_credentials in DB)
  upstream: {
    openai: env.OPENAI_API_KEY || "",
    anthropic: env.ANTHROPIC_API_KEY || "",
    google: env.GOOGLE_API_KEY || "",
    deepseek: env.DEEPSEEK_API_KEY || "",
  } as Record<string, string>,
  publicBaseUrl: env.PUBLIC_BASE_URL || "http://localhost:8080",
  vatPercent: parseFloat(env.VAT_PERCENT || "10"),
  vnpay: {
    tmnCode: env.VNP_TMN_CODE || "",
    hashSecret: env.VNP_HASH_SECRET || "",
    url: env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  },
  momo: {
    partnerCode: env.MOMO_PARTNER_CODE || "",
    accessKey: env.MOMO_ACCESS_KEY || "",
    secretKey: env.MOMO_SECRET_KEY || "",
    endpoint: env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
  },
  search: {
    provider: env.SEARCH_PROVIDER || "tavily",   // tavily
    apiKey: env.SEARCH_API_KEY || "",
  },
};
