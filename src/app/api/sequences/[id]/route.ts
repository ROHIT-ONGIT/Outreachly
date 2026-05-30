import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  delayDays: z.number().int().min(0),
});

async function getSequenceForUser(id: string, userId: string) {
  return prisma.sequence.findFirst({ where: { id, campaign: { userId } } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const seq = await getSequenceForUser(id, user.id);
  if (!seq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.sequence.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const seq = await getSequenceForUser(id, user.id);
  if (!seq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.sequence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
