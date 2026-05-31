import { schedules } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { sendOutreachEmail } from "@/lib/email";

/**
 * Runs every 15 minutes. For every ACTIVE campaign it walks each lead,
 * figures out which sequence step is due, and sends it via SendGrid.
 *
 * Idempotency: a lead+sequence pair with status PENDING or SENT is skipped,
 * so re-runs never double-send.
 */
export const sendSequencesTask = schedules.task({
  id: "send-sequences",
  cron: "*/15 * * * *",
  run: async () => {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "outreach@outreachly.in";

    const activeCampaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        leads: true,
        sequences: { orderBy: { stepNumber: "asc" } },
      },
    });

    const summary = { sent: 0, skipped: 0, errors: 0 };

    for (const campaign of activeCampaigns) {
      if (campaign.sequences.length === 0) continue;

      for (const lead of campaign.leads) {
        // Stop sequence entirely if lead has replied to any step
        const hasReplied = await prisma.emailLog.findFirst({
          where: {
            leadId: lead.id,
            sequence: { campaignId: campaign.id },
            status: "REPLIED",
          },
        });
        if (hasReplied) { summary.skipped++; continue; }

        // Count all processed steps (SENT, OPENED, REPLIED, BOUNCED)
        const sentLogs = await prisma.emailLog.findMany({
          where: {
            leadId: lead.id,
            sequence: { campaignId: campaign.id },
            status: { in: ["SENT", "OPENED", "REPLIED", "BOUNCED"] },
          },
          include: { sequence: { select: { stepNumber: true } } },
          orderBy: { sequence: { stepNumber: "asc" } },
        });

        if (sentLogs.length >= campaign.sequences.length) {
          summary.skipped++;
          continue;
        }

        const nextSeq = campaign.sequences[sentLogs.length];

        // Check timing: step 1 sends immediately; later steps wait delayDays
        if (sentLogs.length > 0 && nextSeq.delayDays > 0) {
          const lastLog = sentLogs[sentLogs.length - 1];
          if (!lastLog.sentAt) { summary.skipped++; continue; }
          const sendAfter = new Date(
            lastLog.sentAt.getTime() + nextSeq.delayDays * 86_400_000
          );
          if (new Date() < sendAfter) { summary.skipped++; continue; }
        }

        // Idempotency check — skip if we already created a log for this step
        const existing = await prisma.emailLog.findFirst({
          where: {
            leadId: lead.id,
            sequenceId: nextSeq.id,
            status: { in: ["PENDING", "SENT"] },
          },
        });
        if (existing) { summary.skipped++; continue; }

        // Create PENDING log before sending so we have an ID for customArgs
        const log = await prisma.emailLog.create({
          data: { leadId: lead.id, sequenceId: nextSeq.id, status: "PENDING" },
        });

        function personalize(text: string) {
          return text
            .replace(/\{\{firstName\}\}/g, lead.firstName)
            .replace(/\{\{lastName\}\}/g, lead.lastName)
            .replace(/\{\{company\}\}/g, lead.company)
            .replace(/\{\{title\}\}/g, lead.title);
        }

        try {
          await sendOutreachEmail({
            to: lead.email,
            from: fromEmail,
            subject: personalize(nextSeq.subject),
            body: personalize(nextSeq.body),
            emailLogId: log.id,
          });

          await prisma.emailLog.update({
            where: { id: log.id },
            data: { status: "SENT", sentAt: new Date() },
          });

          summary.sent++;
        } catch (err) {
          await prisma.emailLog.update({
            where: { id: log.id },
            data: { status: "BOUNCED" },
          });
          summary.errors++;
          console.error(`[send-sequences] Failed for ${lead.email}:`, err);
        }
      }
    }

    console.log("[send-sequences] Done:", summary);
    return summary;
  },
});
