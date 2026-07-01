import type { Metadata } from "next";
import Link from "next/link";
import { Upload, LineChart, Wand2, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How PortfolioIQ turns your holdings into an institutional-grade analysis: upload, analyze, AI summary, and explore.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Add your portfolio",
    body: "Import your holdings using a CSV or Excel file, or add them manually. PortfolioIQ automatically detects portfolio tables, combines data from multiple sheets when needed, and prepares everything for analysis.",
  },
  {
    icon: LineChart,
    title: "Risk & Performance Analysis",
    body: "The platform calculates a wide range of portfolio metrics — asset allocation, returns, volatility, Sharpe and Sortino ratios, maximum drawdown, beta, Value at Risk, correlation, diversification, and portfolio health. Every result comes from documented formulas and deterministic calculations, so you always know where the numbers come from.",
  },
  {
    icon: Wand2,
    title: "AI Investment Brief",
    body: "Once the analysis is complete, AI reviews the calculated metrics and writes a concise investment brief. It only interprets the numbers that have already been computed, so every insight stays grounded in real data.",
  },
  {
    icon: BarChart3,
    title: "Dive Deeper",
    body: "Explore the Dashboard. Use interactive charts, compare holdings, filter positions, and export your analysis whenever you need it. Your data stays private throughout the session, and no account is required.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 grid-texture" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
          How it works
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          From positions to a portfolio brief
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
          PortfolioIQ computes every metric deterministically and uses AI only to
          explain the results — so the analysis stays accurate and auditable.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="glass rounded-2xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-semibold tabular text-muted-foreground/30">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {s.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/portfolio">
              Build your portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">About PortfolioIQ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
