import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOutreachEmail } from "@/lib/email";

const schema = z.object({
  leadId: z.string().min(1),
  sequenceId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { leadId, sequenceId } = parsed.data;

  // Verify ownership: sequence must belong to a campaign owned by this user
  const sequence = await prisma.sequence.findFirst({
    where: { id: sequenceId, campaign: { userId: user.id } },
    include: { campaign: true },
  });
  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  // Verify the lead belongs to the same campaign
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, campaignId: sequence.campaignId },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Block only if already successfully delivered
  const delivered = await prisma.emailLog.findFirst({
    where: { leadId, sequenceId, status: { in: ["SENT", "OPENED", "REPLIED"] } },
  });
  if (delivered) {
    return NextResponse.json(
      { error: "Email already sent to this lead for this step" },
      { status: 409 }
    );
  }

  // Clean up any stuck PENDING logs so we can retry
  await prisma.emailLog.deleteMany({
    where: { leadId, sequenceId, status: "PENDING" },
  });

  const log = await prisma.emailLog.create({
    data: { leadId, sequenceId, status: "PENDING" },
  });

  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "outreach@outreachly.in";

  try {
    await sendOutreachEmail({
      to: lead.email,
      from: fromEmail,
      subject: sequence.subject,
      body: sequence.body,
      emailLogId: log.id,
    });

    const sent = await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date() },
    });

    return NextResponse.json(sent, { status: 200 });
  } catch (err) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "BOUNCED" },
    });

    console.error("[emails/send] SendGrid error:", err);
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  }
}
