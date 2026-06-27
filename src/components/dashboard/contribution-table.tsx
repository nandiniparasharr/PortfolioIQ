import type { ContributionRow } from "@/types";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Risk & return contribution table.
 * Risk contributions sum to ~100% of portfolio variance by construction.
 */
export function ContributionTable({ rows }: { rows: ContributionRow[] }) {
  const sorted = [...rows].sort((a, b) => b.riskContribution - a.riskContribution);
  const maxRisk = Math.max(...sorted.map((r) => Math.abs(r.riskContribution)), 0.0001);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-2xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 text-left font-medium">Position</th>
            <th className="px-4 py-2.5 text-right font-medium">Weight</th>
            <th className="px-4 py-2.5 text-right font-medium">Volatility</th>
            <th className="px-4 py-2.5 text-right font-medium">Return Contrib.</th>
            <th className="px-4 py-2.5 text-left font-medium">Risk Contribution</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.ticker} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 font-mono text-xs font-semibold text-primary">
                {r.ticker}
              </td>
              <td className="px-4 py-2.5 text-right tabular">
                {formatPercent(r.weight)}
              </td>
              <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                {formatPercent(r.volatility)}
              </td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right tabular",
                  r.returnContribution >= 0 ? "text-positive" : "text-negative",
                )}
              >
                {formatPercent(r.returnContribution)}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(Math.abs(r.riskContribution) / maxRisk) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right tabular text-xs">
                    {formatPercent(r.riskContribution)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
