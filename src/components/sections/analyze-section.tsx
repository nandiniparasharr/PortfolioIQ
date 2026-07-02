"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, PencilLine, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/store/portfolio";
import { SAMPLE_PORTFOLIO } from "@/lib/sample-portfolio";

export function AnalyzeSection() {
  const router = useRouter();
  const clear = usePortfolioStore((s) => s.clear);
  const addHoldings = usePortfolioStore((s) => s.addHoldings);

  const runSample = () => {
    clear();
    addHoldings(SAMPLE_PORTFOLIO);
    router.push("/dashboard");
  };

  return (
    <section id="analyze" className="relative scroll-mt-32 border-t border-border/60 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
            Analyze your portfolio
          </div>
          <h2 className="font-display mt-1 text-3xl text-foreground lg:text-4xl">
            Two ways to get started
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
            Import a file from your broker or add positions by hand. Everything stays in your browser
            for this session — nothing is uploaded or stored.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <StartCard
            href="/portfolio?method=upload"
            icon={Upload}
            title="Upload a file"
            body="Drop a CSV or Excel export from your broker. We auto-detect the table and map columns — even if it doesn't start on row one."
            cta="Import holdings"
          />
          <StartCard
            href="/portfolio?method=manual"
            icon={PencilLine}
            title="Add manually"
            body="Type positions with ticker autocomplete. Quantity and cost per share are captured for full unrealized P&L."
            cta="Enter holdings"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/portfolio">
              Analyze your portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={runSample} className="glass-hover">
            <Sparkles className="h-4 w-4" />
            Try a sample
          </Button>
        </div>
      </div>
    </section>
  );
}

function StartCard({
  href,
  icon: Icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: typeof Upload;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link href={href} className="glass glass-hover group rounded-2xl p-6 text-left">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
