/** Shared chart palette tuned for the dark theme. */

/** Categorical series colors — an indigo-led, jewel-toned palette. */
export const CATEGORICAL = [
  "#6366f1", // indigo (primary)
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ec4899", // pink
  "#22d3ee", // cyan
  "#fb923c", // orange
  "#10b981", // emerald
  "#a855f7", // purple
  "#64748b", // slate
  "#eab308", // yellow
];

export const CHART_COLORS = {
  primary: "#6366f1",
  positive: "#10b981",
  negative: "#ef4444",
  grid: "rgba(100, 116, 139, 0.16)",
  axis: "rgba(100, 116, 139, 0.7)",
  benchmark: "#94a3b8",
};

export function categorical(index: number): string {
  return CATEGORICAL[index % CATEGORICAL.length]!;
}

/** Map a correlation value in [-1, 1] to a heatmap color. */
export function correlationColor(value: number): string {
  // Negative -> teal, zero -> neutral, positive -> warm.
  if (value >= 0) {
    const t = Math.min(1, value);
    const r = Math.round(20 + t * 230);
    const g = Math.round(30 + t * 100);
    const b = Math.round(40 + t * 30);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const t = Math.min(1, -value);
  const r = Math.round(20 + t * 20);
  const g = Math.round(30 + t * 180);
  const b = Math.round(40 + t * 150);
  return `rgb(${r}, ${g}, ${b})`;
}
