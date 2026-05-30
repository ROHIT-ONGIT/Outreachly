import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Verifies the ECDSA signature SendGrid attaches to every event webhook.
 * The public key lives in Mail Settings > Event Webhook > Signature Verification.
 * If SENDGRID_WEBHOOK_SECRET is not set, verification is skipped (dev only).
 */
function verifySignature(
  publicKey: string,
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(timestamp + rawBody);
    return verify.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
}

interface SendGridEvent {
  event: string;
  email: string;
  timestamp: number;
  emailLogId?: string;       // our customArg
  sg_message_id?: string;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const webhookSecret = process.env.SENDGRID_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers.get("X-Twilio-Email-Event-Webhook-Signature") ?? "";
    const timestamp = req.headers.get("X-Twilio-Email-Event-Webhook-Timestamp") ?? "";

    if (!verifySignature(webhookSecret, rawBody, signature, timestamp)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let events: SendGridEvent[];
  try {
    events = JSON.parse(rawBody);
    if (!Array.isArray(events)) throw new Error("Expected array");
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const event of events) {
    const emailLogId = event.emailLogId;
    if (!emailLogId) continue;

    try {
      switch (event.event) {
        case "open":
          await prisma.emailLog.updateMany({
            where: { id: emailLogId, openedAt: null },
            data: { openedAt: new Date(event.timestamp * 1000), status: "OPENED" },
          });
          break;

        case "bounce":
        case "dropped":
        case "blocked":
          await prisma.emailLog.updateMany({
            where: { id: emailLogId },
            data: { status: "BOUNCED" },
          });
          break;

        // click events don't map to a schema field — ignore for now
        default:
          break;
      }
    } catch (err) {
      // Log but don't fail the whole batch — SendGrid retries on non-200
      console.error(`[webhooks/sendgrid] Error processing event ${event.event} for log ${emailLogId}:`, err);
    }
  }

  // SendGrid expects a 200 to stop retrying
  return NextResponse.json({ ok: true });
}
