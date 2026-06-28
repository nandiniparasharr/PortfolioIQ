import type { AllocationSlice } from "@/types";
import { formatCompactCurrency, formatPercent, type Currency } from "@/lib/format";
import { categorical } from "@/components/charts/palette";

/** Horizontal weight bars — used for region / market-cap breakdowns. */
export function AllocationBars({
  data,
  currency,
}: {
  data: AllocationSlice[];
  currency: Currency;
}) {
  const max = Math.max(...data.map((d) => d.weight), 0.0001);
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground">{d.label}</span>
            <span className="tabular text-muted-foreground">
              {formatPercent(d.weight, 1)} · {formatCompactCurrency(d.value, currency)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.weight / max) * 100}%`,
                backgroundColor: categorical(i),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
