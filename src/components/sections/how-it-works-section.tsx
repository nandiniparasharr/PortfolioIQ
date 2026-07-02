import { Upload, LineChart, Wand2, BarChart3 } from "lucide-react";

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

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-32 border-t border-border/60 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
          How it works
        </div>
        <h2 className="font-display mt-1 text-3xl text-foreground lg:text-4xl">
          From positions to a portfolio brief
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
          PortfolioIQ computes every metric deterministically and uses AI only to explain the
          results — so the analysis stays accurate and auditable.
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
                <h3 className="text-base font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
