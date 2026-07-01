"use client";

import Link from "next/link";
import { LineChart } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ISTClock } from "./ist-clock";
import { ScrollNav } from "./scroll-nav";
import { MobileNav } from "./mobile-nav";

/**
 * Top navigation header (liquid-glass bar).
 * Centered pill nav with scroll-spy: About · How it works · Analyze your
 * portfolio · Behind PortfolioIQ. Theme toggle sits in the top-right corner.
 * On small screens the pill nav is replaced by a hamburger + slide-in sidebar.
 */
export function Header() {
  return (
    <header className="glass-bar sticky top-0 z-40">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">PortfolioIQ</span>
              <span className="block text-2xs uppercase tracking-wider text-muted-foreground">
                Analytics Platform
              </span>
            </span>
          </Link>

          {/* Centered pill nav (desktop) */}
          <div className="hidden flex-1 justify-center lg:flex">
            <ScrollNav />
          </div>

          {/* Right controls */}
          <div className="flex shrink-0 items-center gap-2">
            <ISTClock />
            <ThemeToggle />
            {/* Mobile / tablet: hamburger + slide-in sidebar */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
