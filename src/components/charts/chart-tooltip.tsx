"use client";

import type { ReactNode } from "react";

/** Shared tooltip chrome for Recharts custom tooltips. */
export function TooltipShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      {children}
    </div>
  );
}

export function TooltipRow({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {color && (
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="font-medium tabular text-foreground">{value}</span>
    </div>
  );
}
