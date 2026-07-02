"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_TABS } from "./scroll-nav";

/**
 * Hamburger + slide-in sidebar for small screens (hidden on ≥ lg).
 * Links to the same single-page sections as the desktop pill nav.
 * The overlay is portaled to <body> so it escapes the header's backdrop-blur
 * stacking context — otherwise the drawer renders transparent over the page.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
        "transition-opacity duration-200",
      )}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-surface shadow-2xl ring-1 ring-border transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold tracking-tight">Portfolio Prism</span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV_TABS.map((t) => (
            <Link
              key={t.id}
              href={`/#${t.id}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {t.label}
            </Link>
          ))}

          <Button asChild className="mt-3 w-full">
            <Link href="/portfolio" onClick={() => setOpen(false)}>
              Analyze your portfolio
            </Link>
          </Button>
        </nav>
      </aside>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted text-foreground"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
