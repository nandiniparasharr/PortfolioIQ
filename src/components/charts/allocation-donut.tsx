"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSlice } from "@/types";
import { categorical } from "./palette";
import { formatCompactCurrency, formatPercent, type Currency } from "@/lib/format";
import { TooltipShell, TooltipRow } from "./chart-tooltip";

const SIZES = {
  md: { box: "h-52 w-52", inner: 58, outer: 88 },
  lg: { box: "h-64 w-64", inner: 74, outer: 112 },
} as const;

export function AllocationDonut({
  data,
  currency,
  size = "md",
}: {
  data: AllocationSlice[];
  currency: Currency;
  size?: keyof typeof SIZES;
}) {
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

  const s = SIZES[size];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
      <div className={`${s.box} shrink-0`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={s.inner}
              outerRadius={s.outer}
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
                    <TooltipRow label="Value" value={formatCompactCurrency(d.value, currency)} />
                  </TooltipShell>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="grid w-full max-w-sm gap-2">
        {slices.map((d, i) => (
          <li
            key={d.label}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-muted/60"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: categorical(i) }}
              />
              <span className="truncate text-foreground">{d.label}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="font-semibold tabular">{formatPercent(d.weight, 1)}</span>
              <span className="text-2xs tabular text-muted-foreground">
                {formatCompactCurrency(d.value, currency)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
