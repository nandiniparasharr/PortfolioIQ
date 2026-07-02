import { Badge } from "@/components/ui/badge";

const METHODS = [
  "Herfindahl-Hirschman Index",
  "Historical VaR (95% / 99%)",
  "Conditional VaR",
  "Single-factor beta",
  "Risk contribution",
  "Rolling volatility",
];

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-32 border-t border-border/60 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">About</div>
        <h2 className="font-display mt-1 text-3xl text-foreground lg:text-4xl">Portfolio Prism</h2>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground lg:text-base">
          <p>
            Portfolio Prism is a portfolio analytics platform built to help investors understand what
            is actually happening inside their portfolios.
          </p>
          <p>
            Most tools either overwhelm you with numbers or generate generic insights. Portfolio Prism
            takes a different approach. Every portfolio is analyzed using transparent quantitative
            models first, followed by AI-powered commentary that is generated directly from the
            computed results. Every observation is grounded in the underlying analysis, making the
            insights consistent, explainable, and backed by data rather than assumptions.
          </p>
          <p>
            From diversification and risk to performance and downside exposure, Portfolio Prism provides
            the same core analytics used by professional investment teams in a simple, interactive
            dashboard.
          </p>
          <p>
            Whether you&apos;re an investor, finance student, analyst, or simply curious about your
            portfolio, the goal is the same: to give you clear insights you can trust.
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
      </div>
    </section>
  );
}
