"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "./nav";
import { usePortfolioStore } from "@/store/portfolio";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();
  const holdingsCount = usePortfolioStore((s) => s.holdings.length);
  const hasPortfolio = holdingsCount > 0;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-border px-5 transition-colors hover:bg-surface-muted/60"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">PortfolioIQ</div>
          <div className="text-2xs uppercase tracking-wider text-muted-foreground">
            Analytics Platform
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        <div className="px-3 pb-2 pt-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </div>
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const locked = item.requiresPortfolio && !hasPortfolio;
          const Icon = item.icon;

          if (locked) {
            return (
              <div
                key={item.href}
                title="Add a holding to unlock analytics"
                className="group flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <Lock className="h-3.5 w-3.5" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-raised text-foreground"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.href === "/portfolio" && hasPortfolio && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-2xs tabular text-muted-foreground">
                  {holdingsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs uppercase tracking-wider text-muted-foreground">
            Appearance
          </span>
          <ThemeToggle />
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-3">
          <p className="text-2xs leading-relaxed text-muted-foreground">
            Portfolio data is processed locally for this session and is not stored.
          </p>
        </div>
      </div>
    </aside>
  );
}
