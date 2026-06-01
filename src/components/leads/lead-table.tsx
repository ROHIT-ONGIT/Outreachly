"use client";

import { useState } from "react";
import { ExternalLink, MessageSquareReply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lead, EmailStatus } from "@/generated/prisma/client";

type LeadWithStatus = Lead & { emailLogs: { status: EmailStatus }[] };

const STATUS_PRIORITY: EmailStatus[] = ["REPLIED", "OPENED", "SENT", "BOUNCED", "PENDING"];

function getLeadStatus(lead: LeadWithStatus): EmailStatus | "UNSUBSCRIBED" | null {
  if (lead.unsubscribed) return "UNSUBSCRIBED";
  for (const s of STATUS_PRIORITY) {
    if (lead.emailLogs.some((l) => l.status === s)) return s;
  }
  return null;
}

const STATUS_STYLES: Record<EmailStatus | "UNSUBSCRIBED", string> = {
  REPLIED:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  OPENED:       "bg-blue-50 text-blue-700 border-blue-200",
  SENT:         "bg-indigo-50 text-indigo-700 border-indigo-200",
  BOUNCED:      "bg-red-50 text-red-700 border-red-200",
  PENDING:      "bg-amber-50 text-amber-700 border-amber-200",
  UNSUBSCRIBED: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const STATUS_DOT: Record<EmailStatus | "UNSUBSCRIBED", string> = {
  REPLIED:      "bg-emerald-500",
  OPENED:       "bg-blue-500",
  SENT:         "bg-indigo-500",
  BOUNCED:      "bg-red-500",
  PENDING:      "bg-amber-400",
  UNSUBSCRIBED: "bg-zinc-400",
};

const STATUS_LABEL: Record<EmailStatus | "UNSUBSCRIBED", string> = {
  REPLIED:      "Replied",
  OPENED:       "Opened",
  SENT:         "Sent",
  BOUNCED:      "Bounced",
  PENDING:      "Pending",
  UNSUBSCRIBED: "Unsubscribed",
};

function StatusBadge({ lead }: { lead: LeadWithStatus }) {
  const status = getLeadStatus(lead);
  if (!status) {
    return <span className="text-[11px] text-muted-foreground/50">—</span>;
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
      STATUS_STYLES[status]
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function getAIScore(lead: Lead): number {
  let score = 0;
  if (lead.firstName && lead.lastName) score += 20;
  if (lead.email) score += 20;
  if (lead.company) score += 20;
  if (lead.title) score += 20;
  if (lead.linkedinUrl) score += 20;
  return score;
}

function AIScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 60
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-zinc-600 bg-zinc-50 border-zinc-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
        color
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-zinc-400"
        )}
      />
      {score}%
    </span>
  );
}

const avatarColors = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function ReplyButton({ leadId }: { leadId: string }) {
  const [replied, setReplied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function markReplied() {
    setLoading(true);
    await fetch(`/api/leads/${leadId}/replied`, { method: "POST" });
    setReplied(true);
    setLoading(false);
  }

  if (replied) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Replied
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={markReplied}
      className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-emerald-700 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      title="Mark as replied — stops further follow-ups"
    >
      <MessageSquareReply className="h-3.5 w-3.5" />
      {loading ? "…" : "Replied"}
    </Button>
  );
}

export function LeadTable({ leads }: { leads: LeadWithStatus[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-dashed border-border">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-foreground mb-1">No leads yet</p>
        <p className="text-[12px] text-muted-foreground">Add one manually or import a CSV file.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
        {["Lead", "Email", "Company / Title", "AI Score", "Status", "LinkedIn"].map((h) => (
          <p key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {leads.map((lead) => {
          const initials = getInitials(lead.firstName, lead.lastName);
          const gradientClass = getAvatarColor(lead.email);
          const score = getAIScore(lead);

          return (
            <div
              key={lead.id}
              className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors duration-100 group"
            >
              {/* Lead name + avatar */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl bg-gradient-to-br shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm",
                    gradientClass
                  )}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{lead.title || "—"}</p>
                </div>
              </div>

              {/* Email */}
              <p className="text-[12.5px] text-muted-foreground truncate">{lead.email}</p>

              {/* Company / Title */}
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-foreground truncate">{lead.company || "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{lead.title || "—"}</p>
              </div>

              {/* AI Score */}
              <div>
                <AIScoreBadge score={score} />
              </div>

              {/* Status / Reply button */}
              <div className="flex items-center gap-2">
                <StatusBadge lead={lead} />
                <ReplyButton leadId={lead.id} />
              </div>

              {/* LinkedIn */}
              <div>
                {lead.linkedinUrl ? (
                  <a
                    href={lead.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[12px] text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
        <p className="text-[11.5px] text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
