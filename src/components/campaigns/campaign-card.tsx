import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Users, Mail, TrendingUp, MessageSquareReply, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignStatusToggle } from "./campaign-status-toggle";
import type { Campaign, CampaignStatus } from "@/generated/prisma/client";

type CampaignWithCount = Campaign & {
  _count: { leads: number };
  stats: { sent: number; openRate: number; replyRate: number };
};

const statusConfig: Record<CampaignStatus, { label: string; dot: string; text: string; bg: string }> = {
  DRAFT: {
    label: "Draft",
    dot: "bg-zinc-400",
    text: "text-zinc-500",
    bg: "bg-zinc-100",
  },
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  PAUSED: {
    label: "Paused",
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
  },
};

export function CampaignCard({ campaign }: { campaign: CampaignWithCount }) {
  const status = statusConfig[campaign.status];

  return (
    <div className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/60 p-5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[14.5px] leading-snug text-foreground truncate">
            {campaign.name}
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {new Date(campaign.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full",
            status.bg,
            status.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Target description */}
      <p className="text-[12.5px] text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-4">
        {campaign.targetDescription}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
            <Users className="h-3 w-3 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{campaign._count.leads}</p>
            <p className="text-[10px] text-muted-foreground leading-none">Leads</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              {campaign.stats.sent > 0 ? `${campaign.stats.openRate}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none">Open rate</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
            <MessageSquareReply className="h-3 w-3 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              {campaign.stats.sent > 0 ? `${campaign.stats.replyRate}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none">Reply rate</p>
          </div>
        </div>

        {/* Activate / Pause toggle — client component */}
        <div className="ml-auto">
          <CampaignStatusToggle campaignId={campaign.id} status={campaign.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/leads?campaignId=${campaign.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 text-[12px] flex-1 rounded-lg"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Leads
        </Link>
        <Link
          href={`/campaigns/${campaign.id}/emails`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-8 text-[12px] flex-1 rounded-lg group-hover:shadow-sm group-hover:shadow-primary/20"
          )}
        >
          <Mail className="h-3.5 w-3.5" />
          Emails
          <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
        </Link>
      </div>
    </div>
  );
}
