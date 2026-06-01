import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetDescription: z.string().min(1, "Target description is required"),
});

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { leads: true } },
      leads: { select: { emailLogs: { select: { status: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const campaignsWithStats = campaigns.map(({ leads, ...campaign }) => {
    const allLogs = leads.flatMap((l) => l.emailLogs);
    const sent    = allLogs.filter((l) => ["SENT", "OPENED", "REPLIED"].includes(l.status)).length;
    const opened  = allLogs.filter((l) => ["OPENED", "REPLIED"].includes(l.status)).length;
    const replied = allLogs.filter((l) => l.status === "REPLIED").length;
    return {
      ...campaign,
      stats: {
        sent,
        openRate:  sent > 0 ? Math.round((opened  / sent) * 100) : 0,
        replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
      },
    };
  });

  return NextResponse.json(campaignsWithStats);
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: { userId: user.id, ...parsed.data },
  });

  return NextResponse.json(campaign, { status: 201 });
}
