import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/razorpay";

const rowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  title: z.string().min(1),
  linkedinUrl: z.string().optional(),
});

const importSchema = z.object({
  campaignId: z.string().min(1),
  leads: z.array(rowSchema).min(1),
});

async function getLeadsThisMonth(userId: string): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return prisma.lead.count({
    where: {
      campaign: { userId },
      createdAt: { gte: start },
    },
  });
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, userId: user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Plan limit check — must have room for the entire import batch
  const plan = PLANS[user.plan];
  if (plan.leadsPerMonth !== Infinity) {
    const used = await getLeadsThisMonth(user.id);
    const remaining = plan.leadsPerMonth - used;
    if (parsed.data.leads.length > remaining) {
      return NextResponse.json(
        {
          error: `Import would exceed your ${plan.name} plan limit. You can add ${remaining} more lead${remaining !== 1 ? "s" : ""} this month. Upgrade for more.`,
          code: "PLAN_LIMIT_EXCEEDED",
          remaining,
        },
        { status: 403 }
      );
    }
  }

  const result = await prisma.lead.createMany({
    data: parsed.data.leads.map((lead) => ({
      ...lead,
      campaignId: parsed.data.campaignId,
      linkedinUrl: lead.linkedinUrl || null,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ count: result.count }, { status: 201 });
}
