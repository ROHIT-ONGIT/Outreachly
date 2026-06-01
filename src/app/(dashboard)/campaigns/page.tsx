import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Plus, Megaphone, Zap, Users, TrendingUp, Mail } from "lucide-react";

export default async function CampaignsPage() {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const raw = await prisma.campaign.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { leads: true } },
      leads: { select: { emailLogs: { select: { status: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const campaigns = raw.map(({ leads, ...campaign }) => {
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

  const totalLeads = campaigns.reduce((sum, c) => sum + c._count.leads, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const sentCampaigns = campaigns.filter((c) => c.stats.sent > 0);
  const avgOpenRate = sentCampaigns.length > 0
    ? Math.round(sentCampaigns.reduce((sum, c) => sum + c.stats.openRate, 0) / sentCampaigns.length)
    : null;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage and track your AI-powered outreach campaigns
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-9 px-4 text-[13px] rounded-xl shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-shadow"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          New Campaign
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Campaigns",
            value: campaigns.length,
            icon: Megaphone,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: "Active",
            value: activeCampaigns,
            icon: Zap,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Total Leads",
            value: totalLeads,
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Avg. Open Rate",
            value: avgOpenRate !== null ? `${avgOpenRate}%` : "—",
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-card rounded-2xl border border-border/60 px-5 py-4 flex items-center gap-4"
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-foreground leading-none">{value}</p>
              <p className="text-[11.5px] text-muted-foreground mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign grid or empty state */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-2xl py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/50 flex items-center justify-center mb-5">
            <Mail className="h-7 w-7 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-base text-foreground mb-2">No campaigns yet</h3>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-xs leading-relaxed">
            Create your first campaign to start sending AI-personalized cold emails at scale.
          </p>
          <Link
            href="/campaigns/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 px-5 text-[13px] rounded-xl shadow-sm shadow-primary/20"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
