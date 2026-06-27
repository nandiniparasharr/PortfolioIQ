"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "./nav";
import { usePortfolioStore } from "@/store/portfolio";

export function Sidebar() {
  const pathname = usePathname();
  const holdingsCount = usePortfolioStore((s) => s.holdings.length);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">PortfolioIQ</div>
          <div className="text-2xs uppercase tracking-wider text-muted-foreground">
            Analytics Platform
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <div className="px-3 pb-2 pt-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </div>
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
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
              {item.href === "/portfolio" && holdingsCount > 0 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-2xs tabular text-muted-foreground">
                  {holdingsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-md border border-border bg-surface-muted p-3">
          <p className="text-2xs leading-relaxed text-muted-foreground">
            Portfolio data is processed locally for this session and is not stored.
          </p>
        </div>
      </div>
    </aside>
  );
}
