"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RollingPoint } from "@/types";
import { CHART_COLORS } from "./palette";
import { formatDate, formatPercent } from "@/lib/format";
import { TooltipShell, TooltipRow } from "./chart-tooltip";

export function RollingChart({ data }: { data: RollingPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
            tickFormatter={(v) => formatDate(v as string)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => formatPercent(v as number, 0)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as RollingPoint;
              return (
                <TooltipShell>
                  <div className="mb-1 font-medium text-foreground">
                    {formatDate(label as string)}
                  </div>
                  <TooltipRow
                    color={CHART_COLORS.primary}
                    label="Rolling volatility (21d, ann.)"
                    value={formatPercent(p.volatility)}
                  />
                  <TooltipRow
                    color={CHART_COLORS.positive}
                    label="Cumulative return"
                    value={formatPercent(p.cumulativeReturn)}
                  />
                </TooltipShell>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="volatility"
            stroke={CHART_COLORS.primary}
            strokeWidth={1.75}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
