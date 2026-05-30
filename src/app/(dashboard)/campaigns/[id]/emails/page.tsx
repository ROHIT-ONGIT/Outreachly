import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Users } from "lucide-react";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SequenceEditor } from "@/components/emails/sequence-editor";

export default async function CampaignEmailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
  });
  if (!campaign) redirect("/campaigns");

  const leads = await prisma.lead.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      {/* Back nav */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Campaigns
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">{campaign.name}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Email Sequences</p>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email sequence
          </div>
        </div>
      </div>

      <SequenceEditor campaignId={id} leads={leads} />
    </div>
  );
}
