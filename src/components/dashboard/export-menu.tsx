"use client";

import * as React from "react";
import { Download, ChevronDown } from "lucide-react";
import type { PortfolioAnalytics } from "@/types";
import { Button } from "@/components/ui/button";
import {
  exportAnalyticsJson,
  exportHoldingsCsv,
  exportMetricsCsv,
} from "@/lib/export";

export function ExportMenu({ analytics }: { analytics: PortfolioAnalytics }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { label: "Holdings (CSV)", action: () => exportHoldingsCsv(analytics) },
    { label: "Metrics summary (CSV)", action: () => exportMetricsCsv(analytics) },
    { label: "Full analytics (JSON)", action: () => exportAnalyticsJson(analytics) },
  ];

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-52 overflow-hidden rounded-md border border-border bg-surface-raised shadow-lg">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                o.action();
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
