"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeadTable } from "@/components/leads/lead-table";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { ImportLeadsButton } from "@/components/leads/import-leads-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Upload } from "lucide-react";
import type { Campaign, Lead, EmailStatus } from "@/generated/prisma/client";

type LeadWithStatus = Lead & { emailLogs: { status: EmailStatus }[] };

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId") ?? "";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<LeadWithStatus[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then(setCampaigns);
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    setLoadingLeads(true);
    fetch(`/api/leads?campaignId=${campaignId}`)
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .finally(() => setLoadingLeads(false));
  }, [campaignId]);

  function refetchLeads() {
    if (!campaignId) return;
    fetch(`/api/leads?campaignId=${campaignId}`)
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []));
  }

  function handleCampaignChange(id: string | null) {
    if (id) router.push(`/leads?campaignId=${id}`);
  }

  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Leads</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {selectedCampaign
              ? `Showing ${leads.length} lead${leads.length !== 1 ? "s" : ""} in "${selectedCampaign.name}"`
              : "Select a campaign to view and manage its leads"}
          </p>
        </div>

        {campaignId && (
          <div className="flex items-center gap-2">
            <ImportLeadsButton campaignId={campaignId} onImported={refetchLeads} />
            <AddLeadDialog campaignId={campaignId} onAdded={refetchLeads} />
          </div>
        )}
      </div>

      {/* Campaign selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-muted-foreground">Campaign:</span>
        </div>
        <Select value={campaignId} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-72 h-9 text-[13px] rounded-xl border-border/70">
            <SelectValue placeholder="Select a campaign…" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-[13px]">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {!campaignId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-2xl">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Upload className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground mb-1">No campaign selected</p>
          <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
            Choose a campaign above to view and manage its leads.
          </p>
        </div>
      ) : loadingLeads ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px]">Loading leads…</span>
          </div>
        </div>
      ) : (
        <LeadTable leads={leads} />
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
