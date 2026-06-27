"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart } from "lucide-react";
import { PRIMARY_NAV } from "./nav";
import { cn } from "@/lib/utils";

/** Compact top bar. On small screens it also carries the primary nav. */
export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-semibold tracking-tight">PortfolioIQ</span>
      </div>

      <nav className="flex items-center gap-1 lg:hidden">
        {PRIMARY_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-surface-raised text-foreground"
                  : "text-muted-foreground",
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
        <div className="hidden items-center gap-1.5 text-2xs text-muted-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-positive" />
          Session active
        </div>
      </div>
    </header>
  );
}
