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
          PortfolioIQ is a portfolio analytics platform built to help investors understand what is actually happening inside their portfolios.
          </p>
          <p>
            Most tools either overwhelm you with numbers or generate generic insights. PortfolioIQ takes a different approach. 
            Every portfolio is analyzed using transparent quantitative models first, followed by AI-powered commentary that is generated directly 
            from the computed results. Every observation is grounded in the underlying analysis, making the insights consistent, explainable, and 
            backed by data rather than assumptions.
          </p>
          <p>
            From diversification and risk to performance and downside exposure, PortfolioIQ provides the same core analytics used by professional 
            investment teams in a simple, interactive dashboard.
          </p>
          <p>
            Whether you're an investor, finance student, analyst, or simply curious about your portfolio, the goal is the same: to give you clear insights you can trust.
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
