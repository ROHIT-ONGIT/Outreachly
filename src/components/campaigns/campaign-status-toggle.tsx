"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/generated/prisma/client";

interface Props {
  campaignId: string;
  status: CampaignStatus;
}

export function CampaignStatusToggle({ campaignId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (status === "COMPLETED") return null;

  const isActive = status === "ACTIVE";
  const action = isActive ? "pause" : "activate";

  async function handleToggle() {
    setLoading(true);
    try {
      await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-150",
        isActive
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isActive ? (
        <PauseCircle className="h-3.5 w-3.5" />
      ) : (
        <PlayCircle className="h-3.5 w-3.5" />
      )}
      {loading ? "…" : isActive ? "Pause" : "Activate"}
    </button>
  );
}
