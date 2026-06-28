"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "./palette";
import { formatCompactCurrency, formatDate, type Currency } from "@/lib/format";
import { TooltipShell, TooltipRow } from "./chart-tooltip";

export function EquityCurveChart({
  data,
  currency,
}: {
  data: { date: string; value: number }[];
  currency: Currency;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={52}
            tickFormatter={(v) => formatCompactCurrency(v as number, currency)}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <TooltipShell>
                  <div className="mb-1 font-medium text-foreground">
                    {formatDate(label as string)}
                  </div>
                  <TooltipRow
                    color={CHART_COLORS.primary}
                    label="Portfolio value"
                    value={formatCompactCurrency(payload[0]!.value as number, currency)}
                  />
                </TooltipShell>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            strokeWidth={1.75}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
