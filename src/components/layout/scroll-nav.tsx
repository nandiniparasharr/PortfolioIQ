"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Single-page section tabs, in the order requested:
 * About · How it works · Analyze your portfolio · Behind PortfolioIQ.
 * Each links to a section anchor on the home page.
 */
export const NAV_TABS = [
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How it works" },
  { id: "analyze", label: "Analyze your portfolio", emphasis: true },
  { id: "behind", label: "Contact" },
] as const;

/**
 * Centered, pill-style navigation with a scroll-spy active state and a
 * liquid-glass hover. On narrow screens the rail scrolls horizontally.
 */
export function ScrollNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = React.useState<string>("about");

  React.useEffect(() => {
    if (!onHome) return;

    const sections = NAV_TABS.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <div
      className={cn(
        "glass-nav no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full p-1",
        className,
      )}
    >
      {NAV_TABS.map((t) => {
        const isActive = onHome && active === t.id;
        const emphasis = "emphasis" in t && t.emphasis;
        return (
          <Link
            key={t.id}
            href={`/#${t.id}`}
            className={cn(
              "nav-tab whitespace-nowrap rounded-full px-3.5 py-2 text-2xs font-semibold uppercase tracking-wider sm:text-xs",
              isActive && "nav-tab-active",
              emphasis && !isActive && "nav-tab-emphasis",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
