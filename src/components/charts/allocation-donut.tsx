"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSlice } from "@/types";
import { categorical } from "./palette";
import { formatCompactCurrency, formatPercent } from "@/lib/format";
import { TooltipShell, TooltipRow } from "./chart-tooltip";

export function AllocationDonut({ data }: { data: AllocationSlice[] }) {
  const top = data.slice(0, 11);
  const rest = data.slice(11);
  const slices =
    rest.length > 0
      ? [
          ...top,
          {
            label: "Other",
            value: rest.reduce((s, d) => s + d.value, 0),
            weight: rest.reduce((s, d) => s + d.weight, 0),
          },
        ]
      : top;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={1.5}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {slices.map((_, i) => (
                <Cell key={i} fill={categorical(i)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]!.payload as AllocationSlice;
                return (
                  <TooltipShell>
                    <div className="mb-1 font-medium text-foreground">{d.label}</div>
                    <TooltipRow label="Weight" value={formatPercent(d.weight)} />
                    <TooltipRow label="Value" value={formatCompactCurrency(d.value)} />
                  </TooltipShell>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-1">
        {slices.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: categorical(i) }}
              />
              <span className="truncate text-muted-foreground">{d.label}</span>
            </span>
            <span className="shrink-0 font-medium tabular">{formatPercent(d.weight, 1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
