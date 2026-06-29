"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how-it-works", label: "How it works?" },
  { href: "/#about", label: "About" },
  { href: "/dashboard", label: "Analytics" },
];

/** Hamburger + slide-in drawer for small screens (hidden on ≥ sm). */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted text-foreground"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

        {/* Drawer */}
        <aside
          className={cn(
            "absolute right-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <LineChart className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-semibold tracking-tight">PortfolioIQ</span>
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
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}

            <Button asChild className="mt-3 w-full">
              <Link href="/portfolio" onClick={() => setOpen(false)}>
                Build your portfolio
              </Link>
            </Button>
          </nav>

          <div className="flex items-center justify-between border-t border-border p-4">
            <span className="text-2xs uppercase tracking-wider text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
        </aside>
      </div>
    </div>
  );
}
