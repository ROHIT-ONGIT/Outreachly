import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@/generated/prisma/client";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

function planFromRazorpayPlanId(planId: string): Plan | null {
  if (planId === process.env.RAZORPAY_STARTER_PLAN_ID) return "STARTER";
  if (planId === process.env.RAZORPAY_GROWTH_PLAN_ID) return "GROWTH";
  if (planId === process.env.RAZORPAY_PRO_PLAN_ID) return "PRO";
  return null;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("X-Razorpay-Signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (secret && !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event: string;
    payload: {
      subscription?: {
        entity: {
          id: string;
          plan_id: string;
          customer_id: string;
          status: string;
          current_end: number | null;
        };
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sub = payload.payload.subscription?.entity;
  if (!sub) return NextResponse.json({ ok: true });

  const { event } = payload;

  try {
    switch (event) {
      case "subscription.activated":
      case "subscription.charged": {
        const plan = planFromRazorpayPlanId(sub.plan_id);
        if (!plan) break;

        const currentPeriodEnd = sub.current_end
          ? new Date(sub.current_end * 1000)
          : new Date(Date.now() + 30 * 86_400_000);

        // Find the subscription record we created during checkout
        const existing = await prisma.subscription.findFirst({
          where: { stripeSubId: sub.id },
        });

        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              stripeCustomerId: sub.customer_id || existing.stripeCustomerId,
              plan,
              status: "active",
              currentPeriodEnd,
            },
          });
          // Upgrade the user's plan
          await prisma.user.update({
            where: { id: existing.userId },
            data: { plan },
          });
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const existing = await prisma.subscription.findFirst({
          where: { stripeSubId: sub.id },
        });
        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: { status: "cancelled" },
          });
          await prisma.user.update({
            where: { id: existing.userId },
            data: { plan: "FREE" },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhooks/razorpay] Error processing event:", event, err);
    // Return 200 anyway — Razorpay retries on non-2xx
  }

  return NextResponse.json({ ok: true });
}
