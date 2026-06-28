"use client";

import { usePortfolioStore } from "@/store/portfolio";
import { CURRENCY_META, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

const ORDER: Currency[] = ["INR", "USD"];

/** Compact segmented control for the session display currency. */
export function CurrencyToggle({ className }: { className?: string }) {
  const currency = usePortfolioStore((s) => s.currency);
  const setCurrency = usePortfolioStore((s) => s.setCurrency);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface-muted p-0.5",
        className,
      )}
      role="group"
      aria-label="Display currency"
    >
      {ORDER.map((c) => {
        const active = currency === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            aria-pressed={active}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-surface-raised text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {CURRENCY_META[c].symbol} {CURRENCY_META[c].label}
          </button>
        );
      })}
    </div>
  );
}
