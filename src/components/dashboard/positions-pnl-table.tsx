import type { ResolvedPosition } from "@/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  type Currency,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/** Signed, compact P/L amount, e.g. "+₹19.5K" / "-₹2.1K". */
function signedCompact(value: number | undefined, currency: Currency): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatCompactCurrency(Math.abs(value), currency)}`;
}

/**
 * Per-position summary: weight, average buy price, return and current value,
 * with the unrealized P/L amount shown in green / red.
 */
export function PositionsPnlTable({
  positions,
  currency,
}: {
  positions: ResolvedPosition[];
  currency: Currency;
}) {
  const rows = [...positions].sort((a, b) => b.weight - a.weight);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-2xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 text-left font-medium">Ticker</th>
            <th className="px-4 py-2.5 text-right font-medium">Weight</th>
            <th className="px-4 py-2.5 text-right font-medium">Avg Price</th>
            <th className="px-4 py-2.5 text-right font-medium">Return</th>
            <th className="px-4 py-2.5 text-right font-medium">Current Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const ret = p.unrealizedReturn;
            const gain = p.unrealizedGain;
            const positive = (gain ?? 0) >= 0;
            return (
              <tr key={p.data.meta.ticker} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-primary">
                  {p.data.meta.ticker}
                </td>
                <td className="px-4 py-2.5 text-right tabular">
                  {formatPercent(p.weight)}
                </td>
                <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                  {p.holding.purchasePrice
                    ? formatCurrency(p.holding.purchasePrice, currency, true)
                    : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right tabular",
                    ret === undefined
                      ? "text-muted-foreground"
                      : ret >= 0
                        ? "text-positive"
                        : "text-negative",
                  )}
                >
                  {ret === undefined ? "—" : formatSignedPercent(ret)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="tabular font-medium">
                    {formatCompactCurrency(p.marketValue, currency)}
                  </div>
                  <div
                    className={cn(
                      "text-2xs tabular",
                      positive ? "text-positive" : "text-negative",
                    )}
                  >
                    {signedCompact(gain, currency)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
