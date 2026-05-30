"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  targetDescription: z.string().min(10, "Please describe your target audience (min 10 chars)"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string[]>>;

export function CampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      targetDescription: fd.get("targetDescription") as string,
    };

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setServerError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        setServerError("Failed to create campaign. Please try again.");
        return;
      }

      router.push("/campaigns");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
          Campaign Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Q4 SaaS Outreach"
          className="h-10 text-[13px] rounded-xl border-border/70 focus:border-primary/50"
        />
        {errors.name && <p className="text-[11px] text-destructive">{errors.name[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetDescription" className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
          Target Audience
        </Label>
        <Textarea
          id="targetDescription"
          name="targetDescription"
          placeholder="CTOs at Series A SaaS startups in the US with 10–50 employees"
          rows={4}
          className="text-[13px] rounded-xl border-border/70 focus:border-primary/50 resize-none"
        />
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          Be specific — the AI uses this to craft hyper-personalised emails for every lead.
        </p>
        {errors.targetDescription && (
          <p className="text-[11px] text-destructive">{errors.targetDescription[0]}</p>
        )}
      </div>

      {serverError && (
        <p className="text-[12px] text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-6 text-[13px] rounded-xl shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-shadow"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
          ) : (
            <><Megaphone className="h-4 w-4" /> Create Campaign</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 px-5 text-[13px] rounded-xl"
          onClick={() => router.push("/campaigns")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
