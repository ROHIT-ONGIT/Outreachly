import { UserButton } from "@clerk/nextjs";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Zap, Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Premium dark sidebar */}
      <aside className="w-[260px] bg-sidebar text-sidebar-foreground flex flex-col shrink-0 relative overflow-hidden">
        {/* Subtle ambient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-600/8 to-transparent pointer-events-none" />

        {/* Brand */}
        <div className="relative px-5 pt-6 pb-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-white">
                Outreachly
              </span>
              <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase mt-0.5">
                AI Outreach
              </p>
            </div>
          </div>
        </div>

        <SidebarNav />

        {/* Upgrade prompt */}
        <div className="relative mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/15">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-300">Free Plan</span>
          </div>
          <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">
            Upgrade to send unlimited emails with AI.
          </p>
          <a
            href="/settings"
            className="mt-2 inline-flex items-center text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Upgrade →
          </a>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-lg",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-sidebar-foreground/80 truncate">My Account</p>
              <p className="text-[11px] text-sidebar-foreground/40">Settings & billing</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
