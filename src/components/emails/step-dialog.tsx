"use client";

import { useState } from "react";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Building2,
  Briefcase,
  Mail,
  ExternalLink,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";
import type { Lead, Sequence } from "@/generated/prisma/client";

interface EmailVariant {
  subject: string;
  body: string;
}

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  delayDays: z.coerce.number().int().min(0),
});

type Props = {
  campaignId: string;
  leads: Lead[];
  nextStepNumber: number;
  editingSequence?: Sequence;
  trigger?: React.ReactNode;
  onSaved: () => void;
};

function LeadIntelCard({ lead }: { lead: Lead }) {
  const dataPoints = [
    { icon: Building2, label: "Company", value: lead.company },
    { icon: Briefcase, label: "Title", value: lead.title },
    { icon: Mail, label: "Email", value: lead.email },
  ];

  const completeness = [
    lead.firstName,
    lead.lastName,
    lead.email,
    lead.company,
    lead.title,
    lead.linkedinUrl,
  ].filter(Boolean).length;
  const score = Math.round((completeness / 6) * 100);

  return (
    <div className="space-y-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[13px] font-bold text-white shadow-sm shrink-0">
          {lead.firstName[0]}{lead.lastName[0]}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">
            {lead.firstName} {lead.lastName}
          </p>
          <p className="text-[12px] text-muted-foreground">{lead.title || "No title"}</p>
        </div>
      </div>

      {/* Data points */}
      <div className="space-y-2">
        {dataPoints.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                {label}
              </p>
              <p className="text-[12.5px] text-foreground truncate">{value || "—"}</p>
            </div>
          </div>
        ))}
        {lead.linkedinUrl && (
          <div className="flex items-start gap-2.5">
            <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                LinkedIn
              </p>
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* AI readiness score */}
      <div className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            AI Readiness
          </p>
          <span className="text-[12px] font-bold text-foreground">{score}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              score >= 80
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : score >= 60
                ? "bg-gradient-to-r from-amber-400 to-orange-400"
                : "bg-gradient-to-r from-zinc-400 to-zinc-500"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10.5px] text-muted-foreground mt-1.5">
          {score >= 80
            ? "Excellent — AI will generate highly personalized emails"
            : score >= 60
            ? "Good — add LinkedIn URL to improve personalization"
            : "Add more data for better AI output"}
        </p>
      </div>
    </div>
  );
}

function EmailPreview({
  subject,
  body,
  isGenerated,
}: {
  subject: string;
  body: string;
  isGenerated: boolean;
}) {
  if (!subject && !body) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/60 flex items-center justify-center mb-3">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <p className="text-[13px] font-medium text-foreground mb-1">No preview yet</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[200px]">
          Write your email manually or generate one with AI
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {isGenerated && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100/60">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-indigo-700">Generated by AI</span>
          <span className="ml-auto text-[10px] text-indigo-400 font-medium">gpt-4o</span>
        </div>
      )}
      <div className="flex-1 p-5 overflow-auto">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Subject
            </p>
            <p className="text-[14px] font-semibold text-foreground">{subject || "—"}</p>
          </div>
          <div className="h-px bg-border/50" />
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Body
            </p>
            <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
              {body || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepDialog({
  campaignId,
  leads,
  nextStepNumber,
  editingSequence,
  trigger,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(editingSequence?.subject ?? "");
  const [body, setBody] = useState(editingSequence?.body ?? "");
  const [delayDays, setDelayDays] = useState(String(editingSequence?.delayDays ?? 0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<EmailVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [genError, setGenError] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;

  function resetForm() {
    setSubject(editingSequence?.subject ?? "");
    setBody(editingSequence?.body ?? "");
    setDelayDays(String(editingSequence?.delayDays ?? 0));
    setErrors({});
    setVariants([]);
    setSelectedVariant(null);
    setGenError("");
    setIsGenerated(false);
  }

  async function handleGenerate() {
    if (!selectedLeadId) { setGenError("Select a lead first"); return; }
    setGenerating(true);
    setGenError("");
    setVariants([]);
    setIsGenerated(false);
    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId, campaignId }),
      });
      const json = await res.json();
      if (!res.ok) { setGenError("Generation failed. Try again."); return; }
      const v: EmailVariant[] = json.variants ?? [];
      setVariants(v);
      if (v.length > 0) {
        setSubject(v[0].subject);
        setBody(v[0].body);
        setSelectedVariant(0);
        setIsGenerated(true);
      }
    } finally {
      setGenerating(false);
    }
  }

  function applyVariant(i: number) {
    setSelectedVariant(i);
    setSubject(variants[i].subject);
    setBody(variants[i].body);
    setIsGenerated(true);
  }

  async function handleSave() {
    const parsed = schema.safeParse({ subject, body, delayDays });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({
        subject: fe.subject?.[0] ?? "",
        body: fe.body?.[0] ?? "",
        delayDays: fe.delayDays?.[0] ?? "",
      });
      return;
    }
    setSaving(true);
    try {
      const url = editingSequence ? `/api/sequences/${editingSequence.id}` : "/api/sequences";
      const method = editingSequence ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          ...(editingSequence ? {} : { campaignId, stepNumber: nextStepNumber }),
        }),
      });
      if (res.ok) {
        setOpen(false);
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger className={cn(!trigger && buttonVariants({ size: "sm" }), !trigger && "h-9 px-4 text-[13px] rounded-xl")}>
        {trigger ?? <><Plus className="h-3.5 w-3.5 mr-1" /> Add Step</>}
      </DialogTrigger>

      <DialogContent className="max-w-5xl sm:max-w-5xl w-[90vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl">
        {/* Dialog header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 shrink-0">
          <DialogTitle className="text-[15px] font-bold">
            {editingSequence
              ? `Edit Step ${editingSequence.stepNumber}`
              : `Add Step ${nextStepNumber}`}
          </DialogTitle>
        </DialogHeader>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left column — Lead intel + controls */}
          <div className="w-72 shrink-0 border-r border-border/60 flex flex-col">
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {/* Lead selector */}
              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Select Lead
                </Label>
                {leads.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">Add leads to use AI generation.</p>
                ) : (
                  <Select value={selectedLeadId} onValueChange={(v) => v && setSelectedLeadId(v)}>
                    <SelectTrigger className="text-[12px] h-9 rounded-xl">
                      <SelectValue placeholder="Pick a lead…" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id} className="text-[12px]">
                          {l.firstName} {l.lastName} — {l.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Lead intel card */}
              {selectedLead && (
                <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Lead Intel
                  </p>
                  <LeadIntelCard lead={selectedLead} />
                </div>
              )}

              {/* Generate button */}
              {leads.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={generating || !selectedLeadId}
                    onClick={handleGenerate}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-semibold transition-all",
                      generating || !selectedLeadId
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/30"
                    )}
                  >
                    {generating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate with AI</>
                    )}
                  </button>
                  {genError && <p className="text-[11px] text-destructive">{genError}</p>}
                </div>
              )}

              {/* Variant selector */}
              {variants.length > 1 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Variants
                  </p>
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyVariant(i)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl border text-[12px] transition-all",
                        selectedVariant === i
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {selectedVariant === i && (
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <span className="font-medium truncate">{v.subject}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — Email editor + live preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab-style header */}
            <div className="flex border-b border-border/60 bg-muted/20 shrink-0">
              <div className="px-4 py-2.5 text-[12px] font-semibold text-foreground border-b-2 border-primary">
                Compose
              </div>
              <div className="px-4 py-2.5 text-[12px] text-muted-foreground">Preview</div>
            </div>

            <div className="flex-1 overflow-auto grid grid-rows-[auto_1fr] gap-0">
              {/* Form fields */}
              <div className="px-6 pt-5 pb-4 border-b border-border/40 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Subject Line
                  </Label>
                  <Input
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setIsGenerated(false); }}
                    placeholder="Write a compelling subject…"
                    className="h-9 text-[13px] rounded-xl border-border/70 focus:border-primary/50"
                  />
                  {errors.subject && <p className="text-[11px] text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Email Body
                  </Label>
                  <Textarea
                    value={body}
                    onChange={(e) => { setBody(e.target.value); setIsGenerated(false); }}
                    placeholder="Write your email body or generate with AI…"
                    rows={6}
                    className="text-[13px] rounded-xl border-border/70 focus:border-primary/50 resize-none"
                  />
                  {errors.body && <p className="text-[11px] text-destructive">{errors.body}</p>}
                </div>
              </div>

              {/* Live preview panel */}
              <div className="border rounded-xl border-border/50 mx-6 my-4 overflow-hidden bg-card shadow-sm">
                <EmailPreview subject={subject} body={body} isGenerated={isGenerated} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer action bar */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 mr-4">
            <Label className="text-[12px] text-muted-foreground whitespace-nowrap">Send after</Label>
            <Input
              type="number"
              min={0}
              value={delayDays}
              onChange={(e) => setDelayDays(e.target.value)}
              className="w-20 h-8 text-[12px] rounded-lg text-center"
            />
            <span className="text-[12px] text-muted-foreground">days</span>
            {errors.delayDays && <p className="text-[11px] text-destructive">{errors.delayDays}</p>}
          </div>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-9 px-4 text-[13px] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 text-[13px] rounded-xl shadow-sm shadow-primary/20"
          >
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Save Step</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
