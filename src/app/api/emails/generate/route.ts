import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEmailVariants } from "@/lib/openai";

const schema = z.object({
  leadId: z.string().min(1),
  campaignId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, userId: user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const lead = await prisma.lead.findFirst({
    where: { id: parsed.data.leadId, campaignId: parsed.data.campaignId },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const variants = await generateEmailVariants({
    leadFirstName: lead.firstName,
    leadLastName: lead.lastName,
    leadEmail: lead.email,
    leadCompany: lead.company,
    leadTitle: lead.title,
    leadLinkedinUrl: lead.linkedinUrl,
    campaignTargetDescription: campaign.targetDescription,
  });

  return NextResponse.json({ variants });
}
