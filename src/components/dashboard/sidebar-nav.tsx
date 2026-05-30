"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Megaphone, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30">
        Workspace
      </p>
      {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative",
              active
                ? "bg-white/8 text-white"
                : "text-sidebar-foreground/55 hover:text-sidebar-foreground/90 hover:bg-white/5"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-indigo-400" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
              )}
            />
            {label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
            )}
          </Link>
        );
      })}

      <p className="px-3 mt-5 mb-2 text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30">
        Account
      </p>
      {navItems.slice(3).map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative",
              active
                ? "bg-white/8 text-white"
                : "text-sidebar-foreground/55 hover:text-sidebar-foreground/90 hover:bg-white/5"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-indigo-400" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
