import { createHmac } from "node:crypto";
import { config } from "../config.js";

// VNPay pay/IPN signing (HMAC-SHA512). Matches the official Node sample:
// values url-encoded with spaces as "+", keys sorted, sign the joined string.

function enc(v: string): string {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

function sortedSignData(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${enc(params[k])}`)
    .join("&");
}

function ymdHis(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Build a redirect URL to VNPay for a top-up. amountVnd is in plain VND. */
export function buildVnpayUrl(opts: { amountVnd: number; ref: string; orderInfo: string; ipAddr: string; returnUrl: string }): string {
  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.vnpay.tmnCode,
    vnp_Amount: String(Math.round(opts.amountVnd) * 100), // VNPay uses amount*100
    vnp_CurrCode: "VND",
    vnp_TxnRef: opts.ref,
    vnp_OrderInfo: opts.orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: opts.returnUrl,
    vnp_IpAddr: opts.ipAddr || "127.0.0.1",
    vnp_CreateDate: ymdHis(new Date()),
  };
  const signData = sortedSignData(params);
  const hash = createHmac("sha512", config.vnpay.hashSecret).update(signData, "utf8").digest("hex");
  return `${config.vnpay.url}?${signData}&vnp_SecureHash=${hash}`;
}

/** Verify a VNPay return/IPN query. */
export function verifyVnpay(query: Record<string, string>): { valid: boolean; ref: string; amountVnd: number; success: boolean } {
  const received = query.vnp_SecureHash || "";
  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const signData = sortedSignData(params);
  const expected = createHmac("sha512", config.vnpay.hashSecret).update(signData, "utf8").digest("hex");
  return {
    valid: received.toLowerCase() === expected.toLowerCase(),
    ref: query.vnp_TxnRef || "",
    amountVnd: Math.round(Number(query.vnp_Amount || "0") / 100),
    success: query.vnp_ResponseCode === "00" && query.vnp_TransactionStatus === "00",
  };
}
