"use client";

import { useEffect, useState } from "react";
import { StepDialog } from "./step-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, ArrowDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, Sequence } from "@/generated/prisma/client";

export function SequenceEditor({
  campaignId,
  leads,
}: {
  campaignId: string;
  leads: Lead[];
}) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSequences() {
    const res = await fetch(`/api/sequences?campaignId=${campaignId}`);
    const data = await res.json();
    setSequences(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchSequences(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this step?")) return;
    await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    fetchSequences();
  }

  const nextStepNumber = sequences.length + 1;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">
            {sequences.length === 0
              ? "No steps yet — build your outreach sequence"
              : `${sequences.length} step${sequences.length !== 1 ? "s" : ""} in this sequence`}
          </p>
        </div>
        <StepDialog
          campaignId={campaignId}
          leads={leads}
          nextStepNumber={nextStepNumber}
          onSaved={fetchSequences}
        />
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px]">Loading sequence…</span>
          </div>
        </div>
      ) : sequences.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-16 text-center bg-card">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/50 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <p className="text-[14px] font-semibold text-foreground mb-1">No sequence steps yet</p>
          <p className="text-[12.5px] text-muted-foreground mb-5 max-w-xs leading-relaxed">
            Add your first email step. Use AI to generate personalized content for each lead.
          </p>
          <StepDialog
            campaignId={campaignId}
            leads={leads}
            nextStepNumber={nextStepNumber}
            onSaved={fetchSequences}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {sequences.map((seq, idx) => (
            <div key={seq.id}>
              {/* Step card */}
              <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border/60 hover:border-primary/20 hover:shadow-sm transition-all duration-150 group">
                {/* Step number badge */}
                <div className="shrink-0 h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/60 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-indigo-600">{seq.stepNumber}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13.5px] text-foreground truncate mb-1">
                    {seq.subject}
                  </p>
                  <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {seq.body}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {seq.delayDays === 0
                      ? "Sends immediately"
                      : `Sends ${seq.delayDays} day${seq.delayDays !== 1 ? "s" : ""} after previous step`}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <StepDialog
                    campaignId={campaignId}
                    leads={leads}
                    nextStepNumber={nextStepNumber}
                    editingSequence={seq}
                    onSaved={fetchSequences}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(seq.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Connector arrow */}
              {idx < sequences.length - 1 && (
                <div className="flex justify-start ml-9 my-1">
                  <ArrowDown className="h-4 w-4 text-border" />
                </div>
              )}
            </div>
          ))}

          {/* Add next step hint */}
          <div className="flex justify-start ml-9 mt-1">
            <ArrowDown className="h-4 w-4 text-border mb-1" />
          </div>
          <div className="flex justify-center">
            <StepDialog
              campaignId={campaignId}
              leads={leads}
              nextStepNumber={nextStepNumber}
              onSaved={fetchSequences}
            />
          </div>
        </div>
      )}
    </div>
  );
}
