import { redirect } from "next/navigation";
import { TrendingUp, Mail, Users, MessageSquare, BarChart3 } from "lucide-react";
import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailsChart } from "@/components/analytics/emails-chart";
import type { ChartDataPoint } from "@/components/analytics/emails-chart";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getAnalytics(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  // Load all email logs for this user's campaigns in one query
  const allLogs = await prisma.emailLog.findMany({
    where: { lead: { campaign: { userId } } },
    select: {
      status: true,
      sentAt: true,
      openedAt: true,
      lead: { select: { id: true, campaignId: true } },
    },
  });

  // Sent = any log that actually left (SENT, OPENED, REPLIED)
  const sentLogs = allLogs.filter((l) =>
    ["SENT", "OPENED", "REPLIED"].includes(l.status)
  );
  const totalSent = sentLogs.length;
  const totalOpened = allLogs.filter((l) => l.openedAt !== null).length;
  const totalReplied = allLogs.filter((l) => l.status === "REPLIED").length;

  // Distinct leads that received at least one email
  const leadsContacted = new Set(sentLogs.map((l) => l.lead.id)).size;

  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  // Chart: emails sent per day over the last 30 days
  const dateMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 86_400_000);
    dateMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const log of sentLogs) {
    if (!log.sentAt) continue;
    const key = log.sentAt.toISOString().split("T")[0];
    if (dateMap.has(key)) dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  }
  const chartData: ChartDataPoint[] = Array.from(dateMap.entries()).map(
    ([date, count]) => ({ date, count })
  );

  // Campaign-level stats
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: "desc" },
  });

  const campaignStats = campaigns.map((c) => {
    const logs = allLogs.filter((l) => l.lead.campaignId === c.id);
    const cSent = logs.filter((l) => ["SENT", "OPENED", "REPLIED"].includes(l.status)).length;
    const cOpened = logs.filter((l) => l.openedAt !== null).length;
    const cReplied = logs.filter((l) => l.status === "REPLIED").length;
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      leads: c._count.leads,
      sent: cSent,
      openRate: cSent > 0 ? Math.round((cOpened / cSent) * 100) : 0,
      replyRate: cSent > 0 ? Math.round((cReplied / cSent) * 100) : 0,
    };
  });

  return {
    leadsContacted,
    totalSent,
    openRate,
    replyRate,
    totalOpened,
    totalReplied,
    chartData,
    campaignStats,
  };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusDot: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  DRAFT: "bg-zinc-400",
  PAUSED: "bg-amber-400",
  COMPLETED: "bg-indigo-500",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const {
    leadsContacted,
    totalSent,
    openRate,
    replyRate,
    totalOpened,
    totalReplied,
    chartData,
    campaignStats,
  } = await getAnalytics(user.id);

  const kpis = [
    {
      label: "Leads Contacted",
      value: leadsContacted.toLocaleString(),
      sub: "distinct leads reached",
      icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      label: "Emails Sent",
      value: totalSent.toLocaleString(),
      sub: "total sequence sends",
      icon: Mail,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
    },
    {
      label: "Open Rate",
      value: totalSent > 0 ? `${openRate}%` : "—",
      sub: `${totalOpened.toLocaleString()} of ${totalSent.toLocaleString()} emails`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Reply Rate",
      value: totalSent > 0 ? `${replyRate}%` : "—",
      sub: `${totalReplied.toLocaleString()} replies received`,
      icon: MessageSquare,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const funnelStages = [
    { label: "Sent", count: totalSent, pct: 100, color: "bg-indigo-500" },
    {
      label: "Opened",
      count: totalOpened,
      pct: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      color: "bg-violet-500",
    },
    {
      label: "Replied",
      count: totalReplied,
      pct: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Performance metrics across all your outreach campaigns
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-card rounded-2xl border border-border/60 p-5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <p className="text-[26px] font-bold text-foreground leading-none">{value}</p>
            <p className="text-[12px] font-semibold text-foreground mt-1">{label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Funnel */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Area chart — 2/3 width */}
        <div className="col-span-2 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">Emails Sent Over Time</h2>
              <p className="text-[12px] text-muted-foreground">Last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
              Sends
            </div>
          </div>
          <EmailsChart data={chartData} />
        </div>

        {/* Funnel — 1/3 width */}
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="text-[14px] font-semibold text-foreground mb-1">Outreach Funnel</h2>
          <p className="text-[12px] text-muted-foreground mb-6">Conversion at each stage</p>
          <div className="space-y-4">
            {funnelStages.map(({ label, count, pct, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-foreground">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign performance table */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Campaign Performance</h2>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {campaignStats.length} campaign{campaignStats.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_80px_80px_90px_90px] gap-4 px-6 py-3 border-b border-border/40 bg-muted/20">
          {["Campaign", "Leads", "Sent", "Open rate", "Reply rate"].map((h) => (
            <p
              key={h}
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
            >
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {campaignStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] font-medium text-foreground mb-1">No campaigns yet</p>
            <p className="text-[12px] text-muted-foreground">
              Stats appear here once you activate campaigns and start sending.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {campaignStats.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_80px_80px_90px_90px] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors"
              >
                {/* Campaign name + status */}
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[c.status] ?? "bg-zinc-400"}`}
                  />
                  <span className="text-[13px] font-medium text-foreground truncate">{c.name}</span>
                </div>

                {/* Leads */}
                <p className="text-[13px] text-foreground font-medium">
                  {c.leads.toLocaleString()}
                </p>

                {/* Sent */}
                <p className="text-[13px] text-foreground font-medium">
                  {c.sent.toLocaleString()}
                </p>

                {/* Open rate */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${c.openRate}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground w-8 text-right">
                    {c.sent > 0 ? `${c.openRate}%` : "—"}
                  </span>
                </div>

                {/* Reply rate */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${c.replyRate}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground w-8 text-right">
                    {c.sent > 0 ? `${c.replyRate}%` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
