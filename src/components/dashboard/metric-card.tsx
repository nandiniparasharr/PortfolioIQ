import { cn } from "@/lib/utils";

export type MetricTone = "neutral" | "positive" | "negative" | "warning";

/** Compact KPI tile used across the dashboard grids. */
export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: MetricTone;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-xl font-semibold tabular tracking-tight",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-2xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
