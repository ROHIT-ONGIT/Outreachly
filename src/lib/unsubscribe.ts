import crypto from "crypto";

function secret() {
  return process.env.UNSUBSCRIBE_SECRET ?? "fallback-dev-secret";
}

export function generateUnsubscribeUrl(leadId: string): string {
  const sig = crypto.createHmac("sha256", secret()).update(leadId).digest("hex");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://outreachly.in";
  return `${base}/api/unsubscribe?lid=${leadId}&sig=${sig}`;
}

export function verifyUnsubscribeToken(leadId: string, sig: string): boolean {
  const expected = crypto.createHmac("sha256", secret()).update(leadId).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}
