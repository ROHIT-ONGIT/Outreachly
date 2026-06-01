import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay, PLANS } from "@/lib/razorpay";

const schema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "PRO"]),
});

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { plan } = parsed.data;
  const planConfig = PLANS[plan];

  if (!planConfig.planId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Create the Razorpay subscription
  const razorSub = await razorpay.subscriptions.create({
    plan_id: planConfig.planId,
    customer_notify: 1,
    // 12 billing cycles then stop; set higher for indefinite
    total_count: 120, // 10 years; effectively indefinite for a monthly subscription
    quantity: 1,
    notes: { userId: user.id, userEmail: user.email },
  });

  // Persist a "created" record so the webhook can match it later
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      // Use the user's internal ID as placeholder until webhook gives us the real customer ID
      stripeCustomerId: user.id,
      stripeSubId: razorSub.id,
      plan,
      status: "created",
      currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000),
    },
    update: {
      stripeSubId: razorSub.id,
      plan,
      status: "created",
    },
  });

  return NextResponse.json({
    subscriptionId: razorSub.id,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
