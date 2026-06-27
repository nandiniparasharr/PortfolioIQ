/** Shared chart palette tuned for the dark institutional theme. */

/** Categorical series colors — muted, desaturated, terminal-like. */
export const CATEGORICAL = [
  "#2dd4bf", // teal (primary)
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f59e0b", // amber
  "#34d399", // emerald
  "#f472b6", // pink
  "#22d3ee", // cyan
  "#fb923c", // orange
  "#94a3b8", // slate
  "#c084fc", // purple
  "#4ade80", // green
  "#facc15", // yellow
];

export const CHART_COLORS = {
  primary: "#2dd4bf",
  positive: "#34d399",
  negative: "#f87171",
  grid: "rgba(148, 163, 184, 0.12)",
  axis: "rgba(148, 163, 184, 0.55)",
  benchmark: "#64748b",
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
