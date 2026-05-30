"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    if (document.getElementById("razorpay-js")) {
      // Script tag exists but might still be loading — wait a tick
      setTimeout(() => resolve(!!window.Razorpay), 1000);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface Props {
  plan: "STARTER" | "GROWTH" | "PRO";
  label: string;
  highlight?: boolean;
  className?: string;
}

export function RazorpayCheckoutButton({ plan, label, highlight, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load Razorpay checkout. Check your connection.");

      const res = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Outreachly",
        description: `${planLabel} Plan — Monthly`,
        image: "/logo.png",
        theme: { color: "#6366f1" },
        modal: { backdropclose: false },
        handler: () => {
          // Webhook updates the DB; redirect to settings with a success flag
          window.location.href = "/settings?upgraded=1";
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={cn(
          "w-full h-9 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all",
          highlight
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/25 hover:shadow-md"
            : "bg-foreground text-background hover:bg-foreground/90",
          loading && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        {loading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening…</>
        ) : (
          <>{label} <ArrowRight className="h-3.5 w-3.5" /></>
        )}
      </button>
      {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
    </div>
  );
}
