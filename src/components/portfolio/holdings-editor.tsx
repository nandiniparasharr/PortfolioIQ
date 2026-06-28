"use client";

import * as React from "react";
import { Trash2, Inbox } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Inline-editable list of current holdings. */
export function HoldingsEditor() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const updateHolding = usePortfolioStore((s) => s.updateHolding);
  const removeHolding = usePortfolioStore((s) => s.removeHolding);
  const clear = usePortfolioStore((s) => s.clear);

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <Inbox className="mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No holdings yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add a position manually or import a CSV to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-2xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 text-left font-medium">Ticker</th>
            <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
            <th className="px-4 py-2.5 text-right font-medium">Cost / Share *</th>
            <th className="px-4 py-2.5 text-right font-medium">Current Price</th>
            <th className="px-4 py-2.5 text-right font-medium">Date</th>
            <th className="w-12 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-mono text-xs font-semibold text-primary">
                {h.ticker}
              </td>
              <td className="px-2 py-1.5 text-right">
                <Input
                  type="number"
                  step="any"
                  value={h.quantity}
                  onChange={(e) =>
                    updateHolding(h.id, { quantity: Number(e.target.value) })
                  }
                  className="h-8 w-28 ml-auto text-right tabular"
                />
              </td>
              <td className="px-2 py-1.5 text-right">
                <Input
                  type="number"
                  step="any"
                  value={h.purchasePrice ?? ""}
                  placeholder="0.00"
                  onChange={(e) =>
                    updateHolding(h.id, {
                      purchasePrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={cn(
                    "h-8 w-28 ml-auto text-right tabular",
                    (h.purchasePrice == null || h.purchasePrice <= 0) &&
                      "border-warning/50",
                  )}
                />
              </td>
              <td className="px-2 py-1.5 text-right">
                <Input
                  type="number"
                  step="any"
                  value={h.currentPrice ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    updateHolding(h.id, {
                      currentPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="h-8 w-28 ml-auto text-right tabular"
                />
              </td>
              <td className="px-2 py-1.5 text-right">
                <Input
                  type="date"
                  value={h.purchaseDate ?? ""}
                  onChange={(e) =>
                    updateHolding(h.id, { purchaseDate: e.target.value || undefined })
                  }
                  className="h-8 w-36 ml-auto text-right tabular"
                />
              </td>
              <td className="px-4 py-1.5 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-negative"
                  onClick={() => removeHolding(h.id)}
                  aria-label={`Remove ${h.ticker}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-surface-muted px-4 py-2">
        <span className="text-2xs uppercase tracking-wide text-muted-foreground">
          {holdings.length} position{holdings.length === 1 ? "" : "s"}
        </span>
        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-negative">
          Clear all
        </Button>
      </div>
    </div>
  );
}
