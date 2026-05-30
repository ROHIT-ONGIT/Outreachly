import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  campaignId: z.string().min(1),
  stepNumber: z.number().int().min(1),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  delayDays: z.number().int().min(0).default(0),
});

export async function GET(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, userId: user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sequences = await prisma.sequence.findMany({
    where: { campaignId },
    orderBy: { stepNumber: "asc" },
  });

  return NextResponse.json(sequences);
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, userId: user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sequence = await prisma.sequence.create({ data: parsed.data });
  return NextResponse.json(sequence, { status: 201 });
}
