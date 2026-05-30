import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/razorpay";

const createSchema = z.object({
  campaignId: z.string().min(1),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
});

async function verifyCampaignOwner(campaignId: string, userId: string) {
  return prisma.campaign.findFirst({ where: { id: campaignId, userId } });
}

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

export async function GET(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const campaign = await verifyCampaignOwner(campaignId, user.id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const leads = await prisma.lead.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await verifyCampaignOwner(parsed.data.campaignId, user.id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Plan limit check
  const plan = PLANS[user.plan];
  if (plan.leadsPerMonth !== Infinity) {
    const used = await getLeadsThisMonth(user.id);
    if (used >= plan.leadsPerMonth) {
      return NextResponse.json(
        {
          error: `You have reached your ${plan.name} plan limit of ${plan.leadsPerMonth} leads/month. Upgrade to add more.`,
          code: "PLAN_LIMIT_EXCEEDED",
        },
        { status: 403 }
      );
    }
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      linkedinUrl: parsed.data.linkedinUrl || null,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
