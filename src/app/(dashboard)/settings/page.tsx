import { redirect } from "next/navigation";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { getOrCreateDbUser } from "@/lib/auth";
import { PLANS } from "@/lib/razorpay";
import { RazorpayCheckoutButton } from "@/components/billing/razorpay-checkout-button";
import type { Plan } from "@/generated/prisma/client";

const planOrder: Plan[] = ["FREE", "STARTER", "GROWTH", "PRO"];

const planDisplay = [
  {
    key: "FREE" as Plan,
    name: "Free",
    price: "₹0",
    period: "/mo",
    features: ["50 leads/month", "1 sender email", "AI email generation", "Basic analytics"],
    highlight: false,
  },
  {
    key: "STARTER" as Plan,
    name: "Starter",
    price: "₹9,900",
    period: "/mo",
    features: ["500 leads/month", "1 sender email", "AI email generation", "Priority support"],
    highlight: false,
  },
  {
    key: "GROWTH" as Plan,
    name: "Growth",
    price: "₹19,900",
    period: "/mo",
    features: ["2,000 leads/month", "3 sender emails", "AI sequences", "Advanced analytics"],
    highlight: true,
  },
  {
    key: "PRO" as Plan,
    name: "Pro",
    price: "₹29,900",
    period: "/mo",
    features: ["Unlimited leads", "10 sender emails", "Custom AI prompts", "Dedicated support"],
    highlight: false,
  },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const { upgraded } = await searchParams;
  const currentPlanKey = user.plan;
  const currentPlanConfig = PLANS[currentPlanKey];
  const currentPlanIndex = planOrder.indexOf(currentPlanKey);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage your billing, plan, and account preferences
        </p>
      </div>

      {/* Upgrade success banner */}
      {upgraded && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-emerald-800">
              Payment received — your plan will activate within a minute.
            </p>
            <p className="text-[12px] text-emerald-600">
              If your plan hasn&apos;t updated yet, refresh the page in a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-card rounded-2xl border border-border/60 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Current Plan</h2>
            <p className="text-[12px] text-muted-foreground">
              You are on the <span className="font-semibold text-foreground">{currentPlanConfig.name}</span> plan
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {currentPlanConfig.leadsPerMonth === Infinity
              ? "Unlimited leads/month"
              : `${currentPlanConfig.leadsPerMonth.toLocaleString()} leads/month`}
          </div>
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {currentPlanConfig.senderAccounts} sender email{currentPlanConfig.senderAccounts > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-foreground mb-4">
          {currentPlanKey === "FREE" ? "Upgrade your plan" : "Your plan & options"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {planDisplay.map((plan, i) => {
            const isCurrent = plan.key === currentPlanKey;
            const isDowngrade = i < currentPlanIndex;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-5 ${
                  plan.highlight && !isCurrent
                    ? "border-primary/40 bg-gradient-to-b from-primary/5 to-transparent shadow-sm shadow-primary/10"
                    : isCurrent
                    ? "border-emerald-300 bg-gradient-to-b from-emerald-50 to-transparent"
                    : "border-border/60 bg-card"
                }`}
              >
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      <Zap className="h-2.5 w-2.5" />
                      Popular
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Current
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[22px] font-bold text-foreground">{plan.price}</span>
                    <span className="text-[12px] text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full h-9 rounded-xl text-[12.5px] font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    Current plan
                  </button>
                ) : plan.key === "FREE" || isDowngrade ? (
                  <button
                    disabled
                    className="w-full h-9 rounded-xl text-[12.5px] font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    {isDowngrade ? "Downgrade" : "Free"}
                  </button>
                ) : (
                  <RazorpayCheckoutButton
                    plan={plan.key as "STARTER" | "GROWTH" | "PRO"}
                    label={`Upgrade to ${plan.name}`}
                    highlight={plan.highlight}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="text-[14px] font-semibold text-foreground mb-1">Account</h2>
        <p className="text-[12px] text-muted-foreground mb-4">Manage your account settings</p>
        <div className="flex items-center justify-between py-3 border-t border-border/50">
          <div>
            <p className="text-[13px] font-medium text-foreground">Delete account</p>
            <p className="text-[12px] text-muted-foreground">
              Permanently remove your account and all data
            </p>
          </div>
          <button className="h-8 px-4 text-[12px] font-semibold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
