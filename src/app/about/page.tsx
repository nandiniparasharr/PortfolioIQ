import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About",
  description:
    "PortfolioIQ is an institutional-grade portfolio analytics platform that computes every metric with transparent quantitative methodology and uses AI only to explain the results.",
};

const METHODS = [
  "Herfindahl-Hirschman Index",
  "Historical VaR (95% / 99%)",
  "Conditional VaR",
  "Single-factor beta",
  "Risk contribution",
  "Rolling volatility",
];

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 grid-texture" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">About</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          Why PortfolioIQ
        </h1>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground lg:text-base">
          <p>
            PortfolioIQ is an institutional-grade portfolio analytics platform
            built for investors who want to understand <em>why</em> a portfolio
            behaves the way it does.
          </p>
          <p>
            Instead of relying on opaque AI-generated opinions, PortfolioIQ
            computes every portfolio metric using transparent quantitative
            methodology and then uses AI only to explain those results in plain
            English. Every insight is grounded in deterministic calculations,
            ensuring the analysis remains accurate, auditable, and free from
            hallucinated conclusions.
          </p>
          <p>
            Whether you&apos;re evaluating diversification, measuring downside
            risk, understanding factor exposure, or reviewing portfolio health,
            PortfolioIQ presents the same core analytics expected from
            professional investment research platforms through a clean, intuitive
            interface.
          </p>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6">
          <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Built on transparent methodology
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <Badge key={m} variant="outline" className="normal-case tracking-normal">
                {m}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/portfolio">
              Build your portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
