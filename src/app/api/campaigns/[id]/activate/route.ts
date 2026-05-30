import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["activate", "pause"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status === "COMPLETED") {
    return NextResponse.json({ error: "Completed campaigns cannot be changed" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const newStatus = parsed.data.action === "activate" ? "ACTIVE" : "PAUSED";

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json(updated);
}
