"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Lock } from "lucide-react";
import { PRIMARY_NAV } from "./nav";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ISTClock } from "./ist-clock";

/** Compact glass top bar. On small screens it also carries the primary nav. */
export function Topbar() {
  const pathname = usePathname();
  const hasPortfolio = usePortfolioStore((s) => s.holdings.length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 px-5 backdrop-blur-xl bg-background/70 lg:px-8">
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-semibold tracking-tight">PortfolioIQ</span>
      </Link>

      <nav className="flex items-center gap-1 lg:hidden">
        {PRIMARY_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const locked = item.requiresPortfolio && !hasPortfolio;
          if (locked) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-muted-foreground/50"
              >
                {item.label}
                <Lock className="h-3 w-3" />
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium",
                active ? "bg-surface-raised text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-3 lg:flex">
        <span className="text-2xs uppercase tracking-wider text-muted-foreground">
          Institutional Portfolio Analytics
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ISTClock />
        <ThemeToggle className="lg:hidden" />
      </div>
    </header>
  );
}
