import { createHmac } from "node:crypto";
import { config } from "../config.js";

// MoMo AIO v2 create-payment + IPN verification (HMAC-SHA256).

function sign(raw: string): string {
  return createHmac("sha256", config.momo.secretKey).update(raw, "utf8").digest("hex");
}

/** Create a MoMo payment and return its payUrl. */
export async function createMomoPayment(opts: { amountVnd: number; ref: string; orderInfo: string; redirectUrl: string; ipnUrl: string }): Promise<string> {
  const { partnerCode, accessKey, endpoint } = config.momo;
  const requestId = opts.ref;
  const orderId = opts.ref;
  const amount = String(Math.round(opts.amountVnd));
  const requestType = "captureWallet";
  const extraData = "";
  const raw =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${opts.ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${opts.orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${opts.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = sign(raw);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      partnerCode, accessKey, requestId, amount, orderId,
      orderInfo: opts.orderInfo, redirectUrl: opts.redirectUrl, ipnUrl: opts.ipnUrl,
      extraData, requestType, signature, lang: "vi",
    }),
  });
  const json = (await res.json()) as { payUrl?: string; resultCode?: number; message?: string };
  if (!json.payUrl) throw new Error(`MoMo create failed: ${json.message ?? json.resultCode}`);
  return json.payUrl;
}

/** Verify a MoMo IPN callback body. */
export function verifyMomoIpn(b: Record<string, string>): { valid: boolean; ref: string; amountVnd: number; success: boolean; providerRef: string } {
  const raw =
    `accessKey=${config.momo.accessKey}&amount=${b.amount}&extraData=${b.extraData}&message=${b.message}` +
    `&orderId=${b.orderId}&orderInfo=${b.orderInfo}&orderType=${b.orderType}&partnerCode=${b.partnerCode}` +
    `&payType=${b.payType}&requestId=${b.requestId}&responseTime=${b.responseTime}&resultCode=${b.resultCode}&transId=${b.transId}`;
  const expected = sign(raw);
  return {
    valid: (b.signature || "") === expected,
    ref: b.orderId || "",
    amountVnd: Math.round(Number(b.amount || "0")),
    success: String(b.resultCode) === "0",
    providerRef: b.transId || "",
  };
}
