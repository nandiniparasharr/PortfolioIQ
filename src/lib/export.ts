import type { PortfolioAnalytics } from "@/types";
import { formatPercent } from "./format";

/** Trigger a client-side file download. */
function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export the resolved holdings + key metrics as a flat CSV. */
export function exportHoldingsCsv(a: PortfolioAnalytics) {
  const header = [
    "ticker",
    "name",
    "sector",
    "region",
    "marketCapBucket",
    "quantity",
    "lastPrice",
    "marketValue",
    "weight",
    "unrealizedReturn",
  ];
  const rows = a.positions.map((p) =>
    [
      p.data.meta.ticker,
      `"${p.data.meta.name}"`,
      `"${p.data.meta.sector}"`,
      `"${p.data.meta.region}"`,
      p.data.meta.marketCapBucket,
      p.holding.quantity,
      p.data.lastPrice.toFixed(2),
      p.marketValue.toFixed(2),
      (p.weight * 100).toFixed(2),
      p.unrealizedReturn !== undefined ? (p.unrealizedReturn * 100).toFixed(2) : "",
    ].join(","),
  );
  download(
    `portfolio-prism-holdings-${a.asOf}.csv`,
    [header.join(","), ...rows].join("\n"),
    "text/csv",
  );
}

/** Export the full analytics object as formatted JSON. */
export function exportAnalyticsJson(a: PortfolioAnalytics) {
  download(
    `portfolio-prism-analytics-${a.asOf}.json`,
    JSON.stringify(a, null, 2),
    "application/json",
  );
}

/** Export a human-readable metrics summary as CSV (metric,value). */
export function exportMetricsCsv(a: PortfolioAnalytics) {
  const lines: [string, string][] = [
    ["As of", a.asOf],
    [`Total value (${a.baseCurrency})`, a.totalValue.toFixed(2)],
    ["Health score", String(a.scores.health)],
    ["Risk score", String(a.scores.risk)],
    ["Diversification score", String(a.scores.diversification)],
    ["Annualized return", formatPercent(a.performance.annualizedReturn)],
    ["Annualized volatility", formatPercent(a.performance.annualizedVolatility)],
    ["Sharpe ratio", a.performance.sharpeRatio.toFixed(2)],
    ["Sortino ratio", a.performance.sortinoRatio.toFixed(2)],
    ["Max drawdown", formatPercent(a.performance.maxDrawdown)],
    ["Beta", a.performance.beta.toFixed(2)],
    ["VaR 95% (1d)", formatPercent(a.risk.valueAtRisk95)],
    ["VaR 99% (1d)", formatPercent(a.risk.valueAtRisk99)],
    ["CVaR 95% (1d)", formatPercent(a.risk.conditionalVaR95)],
    ["HHI", a.diversification.hhi.toFixed(4)],
    ["Effective holdings", a.diversification.effectiveHoldings.toFixed(2)],
    ["Top 5 concentration", formatPercent(a.diversification.concentrationTop5)],
    ["Average correlation", a.risk.averageCorrelation.toFixed(2)],
  ];
  download(
    `portfolio-prism-metrics-${a.asOf}.csv`,
    ["metric,value", ...lines.map(([k, v]) => `"${k}","${v}"`)].join("\n"),
    "text/csv",
  );
}
