import type { PriceSource } from "@/types";
import { cn } from "@/lib/utils";

const LABELS: Record<PriceSource, string> = {
  live: "live",
  user: "entered",
  cost: "at cost",
};

/** Tiny badge indicating how a position's current price was determined. */
export function PriceSourceTag({
  source,
  className,
}: {
  source?: PriceSource;
  className?: string;
}) {
  if (!source) return null;
  return (
    <span
      className={cn(
        "text-2xs",
        source === "live" && "text-positive",
        source === "user" && "text-primary",
        source === "cost" && "text-warning",
        className,
      )}
      title={
        source === "cost"
          ? "No live price found — shown at cost. Enter a current price for accurate P&L."
          : source === "user"
            ? "Using the current price you provided."
            : "Live market price."
      }
    >
      {LABELS[source]}
    </span>
  );
}
