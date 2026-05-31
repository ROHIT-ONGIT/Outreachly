import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId } = await params;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, campaign: { userId: user.id } },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await prisma.emailLog.updateMany({
    where: { leadId, status: { in: ["SENT", "OPENED", "PENDING"] } },
    data: { status: "REPLIED", repliedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
