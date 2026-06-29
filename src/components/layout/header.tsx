"use client";

import Link from "next/link";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ISTClock } from "./ist-clock";
import { MobileNav } from "./mobile-nav";

/**
 * Top navigation header (replaces the former sidebar).
 * Tiles: How it works · Build your portfolio (primary) · About.
 * Theme toggle sits in the top-right corner.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
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
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#how-it-works"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            How it works?
          </Link>
          <Button asChild size="sm" className="hidden px-4 sm:inline-flex">
            <Link href="/portfolio">Build your portfolio</Link>
          </Button>
          <Link
            href="/#about"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            About
          </Link>

          <span className="mx-1 hidden h-5 w-px bg-border md:block" />
          <ISTClock />
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Mobile menu (drawer) */}
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
