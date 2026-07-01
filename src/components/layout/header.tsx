"use client";

import Link from "next/link";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ISTClock } from "./ist-clock";
import { MobileNav } from "./mobile-nav";

/**
 * Top navigation header (replaces the former sidebar).
 * Liquid-glass bar with pill tiles: How it works · Analyze your portfolio
 * (primary) · About · Behind PortfolioIQ.
 * Theme toggle sits in the top-right corner.
 */
export function Header() {
  return (
    <header className="glass-bar sticky top-0 z-40">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
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

        {/* Nav tiles */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/how-it-works" className="nav-pill hidden sm:block">
            How it works?
          </Link>
          <Link href="/about" className="nav-pill hidden sm:block">
            About
          </Link>
          <Link href="/behind" className="nav-pill hidden sm:block">
            Behind PortfolioIQ
          </Link>
          <Button asChild size="sm" className="hidden rounded-full px-4 sm:inline-flex">
            <Link href="/portfolio">Analyze your portfolio</Link>
          </Button>

          <span className="mx-1 hidden h-5 w-px bg-border md:block" />
          <ISTClock />
          {/* Theme toggle stays in the header (outside the mobile drawer). */}
          <ThemeToggle />

          {/* Mobile menu (drawer) */}
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
