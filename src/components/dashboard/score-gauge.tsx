"use client";

import { cn } from "@/lib/utils";

/**
 * Semicircular score gauge (0-100). Color reflects the score band.
 * `invert` flags metrics where lower is better (e.g. risk score).
 */
export function ScoreGauge({
  value,
  label,
  sublabel,
  invert = false,
  size = 132,
}: {
  value: number;
  label: string;
  sublabel?: string;
  invert?: boolean;
  size?: number;
}) {
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const radius = size / 2 - 10;
  const circumference = Math.PI * radius; // semicircle
  const offset = circumference * (1 - clamped / 100);

  const quality = invert ? 100 - clamped : clamped;
  const color =
    quality >= 70 ? "var(--positive)" : quality >= 45 ? "var(--warning)" : "var(--negative)";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={`hsl(${color})`}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <text
          x="50%"
          y={size / 2 - 4}
          textAnchor="middle"
          className="fill-foreground tabular"
          style={{ fontSize: 26, fontWeight: 600 }}
        >
          {Math.round(clamped)}
        </text>
      </svg>
      <div className="mt-1 text-center">
        <div className={cn("text-xs font-semibold tracking-tight")}>{label}</div>
        {sublabel && (
          <div className="text-2xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
    </div>
  );
}
