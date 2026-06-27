import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  PieChart,
  Network,
  Gauge,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CAPABILITIES = [
  {
    icon: PieChart,
    title: "Multi-dimensional allocation",
    body: "Sector, geographic and market-cap exposure with concentration and effective-holdings analysis.",
  },
  {
    icon: Activity,
    title: "Performance analytics",
    body: "Annualized return and volatility, Sharpe, Sortino, maximum drawdown and rolling risk.",
  },
  {
    icon: ShieldCheck,
    title: "Risk engine",
    body: "Historical VaR & Expected Shortfall, beta, and per-position risk contribution.",
  },
  {
    icon: Network,
    title: "Correlation structure",
    body: "Full pairwise correlation matrix and average correlation to quantify diversification.",
  },
  {
    icon: Gauge,
    title: "Composite scoring",
    body: "Transparent Health, Risk and Diversification scores rolled up from documented metrics.",
  },
  {
    icon: Sparkles,
    title: "AI commentary",
    body: "Institutional narrative generated strictly from computed analytics — never fabricated numbers.",
  },
];

const METHODS = [
  "Herfindahl-Hirschman Index",
  "Historical Value at Risk (95% / 99%)",
  "Conditional VaR / Expected Shortfall",
  "Single-factor beta",
  "Risk & return contribution",
  "Rolling annualized volatility",
];

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 grid-texture" />

      <section className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 lg:pt-24">
        <Badge variant="secondary" className="mb-5">
          Institutional Portfolio Analytics
        </Badge>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight lg:text-5xl">
          Analyze any equity portfolio with{" "}
          <span className="text-primary">institutional-grade</span> rigor.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          PortfolioIQ computes allocation, performance, risk and diversification
          analytics from real return series — then layers AI commentary that
          interprets the numbers without ever inventing them. Built to the
          standard of the analytics desks at the firms it emulates.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/portfolio">
              Build a portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">View sample dashboard</Link>
          </Button>
        </div>

        <p className="mt-6 text-2xs uppercase tracking-wider text-muted-foreground">
          No account required · Data processed locally for this session · Not stored
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-card p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border border-border bg-surface p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h2 className="text-lg font-semibold tracking-tight">
                Transparent methodology
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every metric is computed from documented formulas on real daily
                return series. No mocked calculations, no fabricated figures —
                the methodology is published alongside the results.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <Badge key={m} variant="outline" className="normal-case tracking-normal">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
