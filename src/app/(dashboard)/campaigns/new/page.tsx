import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export default function NewCampaignPage() {
  return (
    <div>
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Campaigns
      </Link>

      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">New Campaign</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Define your target audience — the AI will use this to personalise every email.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 p-6 max-w-lg">
        <CampaignForm />
      </div>
    </div>
  );
}
