"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, BarChart3, Inbox } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  formatCompactCurrency,
  formatDate,
  formatPercent,
  formatSignedPercent,
  type Currency,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./section";
import { ScoreGauge } from "./score-gauge";
import { MetricCard, type MetricTone } from "./metric-card";
import { HoldingsTable } from "./holdings-table";
import { PositionsPnlTable } from "./positions-pnl-table";
import { AllocationBars } from "./allocation-bars";
import { CommentaryPanel } from "./commentary-panel";
import { ExportMenu } from "./export-menu";
import { CurrencyToggle } from "@/components/portfolio/currency-toggle";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { EquityCurveChart } from "@/components/charts/equity-curve";
import { RollingChart } from "@/components/charts/rolling-chart";
import { CorrelationHeatmap } from "@/components/charts/correlation-heatmap";
import { classifyAssetClass } from "@/lib/analytics/asset-class";

export function DashboardView() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const currency = usePortfolioStore((s) => s.currency);
  const { status, data, error } = useAnalytics(holdings, currency);
  const [classFilter, setClassFilter] = React.useState<string | null>(null);

  if (holdings.length === 0) return <EmptyState />;
  if (status === "loading" || status === "idle") return <LoadingState />;
  if (status === "error" || !data) return <ErrorState message={error} />;

  const { analytics, commentary } = data;
  const ccy = analytics.baseCurrency as Currency;
  const a = analytics;
  const perf = a.performance;

  const filteredPositions = classFilter
    ? a.positions.filter(
        (p) => classifyAssetClass(p.holding.ticker, p.holding.isin) === classFilter,
      )
    : a.positions;

  const returnTone: MetricTone =
    perf.annualizedReturn >= 0 ? "positive" : "negative";

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Portfolio Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCompactCurrency(a.totalValue, ccy)} across {a.diversification.holdingsCount}{" "}
            holdings · {a.diversification.sectorCount} sectors · as of {formatDate(a.asOf)} IST
            {perf.observations > 0 && ` · ${perf.observations} trading days`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyToggle />
          <ExportMenu analytics={a} />
          <Button asChild variant="outline" size="sm">
            <Link href="/portfolio">Edit holdings</Link>
          </Button>
        </div>
      </div>

      {a.warnings.length > 0 && (
        <div className="space-y-1.5">
          {a.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Scores + overview */}
      <Section id="overview" title="Executive Overview" description="Composite scores and headline metrics.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="flex items-center justify-around gap-2 py-6">
              <ScoreGauge value={a.scores.health} label="Health" sublabel="Composite" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-around gap-2 py-6">
              <ScoreGauge value={a.scores.diversification} label="Diversification" sublabel="0 = concentrated" />
              <div className="h-20 w-px bg-border" />
              <ScoreGauge value={a.scores.risk} label="Risk" sublabel="Higher = riskier" invert />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Value"
            value={formatCompactCurrency(a.totalValue, ccy)}
            hint={a.totalUnrealizedReturn !== undefined ? `Unrealized ${formatSignedPercent(a.totalUnrealizedReturn)}` : undefined}
            tone={a.totalUnrealizedReturn !== undefined && a.totalUnrealizedReturn < 0 ? "negative" : "neutral"}
          />
          <MetricCard label="Annualized Return" value={formatSignedPercent(perf.annualizedReturn)} hint="Geometric, ann." tone={returnTone} />
          <MetricCard label="Annualized Volatility" value={formatPercent(perf.annualizedVolatility)} hint="σ × √252" />
          <MetricCard label="Sharpe Ratio" value={perf.sharpeRatio.toFixed(2)} hint="Risk-adjusted" tone={perf.sharpeRatio >= 1 ? "positive" : "neutral"} />
        </div>
      </Section>

      {/* Allocation */}
      <Section id="allocation" title="Allocation" description="Exposure by asset class, geography and market capitalization.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Asset Class</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationDonut data={a.allocation.byAssetClass} currency={ccy} />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographic</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationBars data={a.allocation.byRegion} currency={ccy} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationBars data={a.allocation.byMarketCap} currency={ccy} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Drill-down: sub-categories within Equity and Mutual Funds */}
        {(a.allocation.byEquityCategory.length > 0 ||
          a.allocation.byFundCategory.length > 0) && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {a.allocation.byEquityCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Equity Breakdown</CardTitle>
                  <CardDescription>Stocks, ETFs and commodity ETFs</CardDescription>
                </CardHeader>
                <CardContent>
                  <AllocationDonut data={a.allocation.byEquityCategory} currency={ccy} />
                </CardContent>
              </Card>
            )}
            {a.allocation.byFundCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mutual Fund Breakdown</CardTitle>
                  <CardDescription>Equity, debt, hybrid and commodity funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <AllocationDonut data={a.allocation.byFundCategory} currency={ccy} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Section>

      {/* Performance */}
      <Section id="performance" title="Performance" description="Equity curve and rolling risk over the analysis window.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={perf.equityCurve} currency={ccy} />
            </CardContent>
          </Card>
          <div className="grid gap-3">
            <MetricCard label="Cumulative Return" value={formatSignedPercent(perf.cumulativeReturn)} tone={perf.cumulativeReturn >= 0 ? "positive" : "negative"} />
            <MetricCard label="Max Drawdown" value={formatPercent(perf.maxDrawdown)} tone="warning" />
            <MetricCard label="Sortino Ratio" value={perf.sortinoRatio.toFixed(2)} />
            <MetricCard label="Beta (vs. market)" value={perf.beta.toFixed(2)} />
          </div>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Rolling Volatility (21-day, annualized)</CardTitle>
          </CardHeader>
          <CardContent>
            <RollingChart data={perf.rolling} />
          </CardContent>
        </Card>
      </Section>

      {/* Risk */}
      <Section id="risk" title="Risk" description="Value at Risk, tail loss and per-position returns.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="VaR 95% (1-day)" value={formatPercent(a.risk.valueAtRisk95)} hint="Historical" tone="warning" />
          <MetricCard label="VaR 99% (1-day)" value={formatPercent(a.risk.valueAtRisk99)} hint="Historical" tone="warning" />
          <MetricCard label="CVaR 95% (1-day)" value={formatPercent(a.risk.conditionalVaR95)} hint="Expected shortfall" tone="negative" />
          <MetricCard label="Avg. Correlation" value={a.risk.averageCorrelation.toFixed(2)} hint="Pairwise mean" />
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Position Returns & P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionsPnlTable positions={a.positions} currency={ccy} />
          </CardContent>
        </Card>
      </Section>

      {/* Correlation */}
      <Section id="correlation" title="Correlation Structure" description="Pairwise correlation of daily returns across holdings.">
        <Card>
          <CardContent className="pt-5">
            <CorrelationHeatmap matrix={a.risk.correlation} />
          </CardContent>
        </Card>
      </Section>

      {/* Holdings */}
      <Section
        id="holdings"
        title="Holdings"
        description="Sortable positions with weights and unrealized performance."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setClassFilter(null)}
              className={filterChip(classFilter === null)}
            >
              All
            </button>
            {a.allocation.byAssetClass.slice(0, 6).map((s) => (
              <button
                key={s.label}
                onClick={() => setClassFilter(s.label)}
                className={filterChip(classFilter === s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      >
        <HoldingsTable positions={filteredPositions} currency={ccy} />
      </Section>

      {/* Commentary */}
      <Section id="commentary" title="AI Commentary" description="Institutional narrative interpreting the computed analytics.">
        <CommentaryPanel commentary={commentary} />
      </Section>
    </div>
  );
}

function filterChip(active: boolean): string {
  return [
    "rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors",
    active
      ? "border-primary/40 bg-primary/15 text-primary"
      : "border-border bg-surface-muted text-muted-foreground hover:text-foreground",
  ].join(" ");
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">No portfolio to analyze</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Add holdings or load a sample portfolio to generate the full analytics suite.
      </p>
      <Button asChild className="mt-5">
        <Link href="/portfolio">
          <BarChart3 className="h-4 w-4" />
          Build a portfolio
        </Link>
      </Button>
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-negative/10">
        <AlertTriangle className="h-6 w-6 text-negative" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Analysis failed</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {message ?? "Something went wrong while analyzing the portfolio."}
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/portfolio">Back to portfolio</Link>
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40 lg:col-span-2" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72" />
      <Skeleton className="h-64" />
    </div>
  );
}
