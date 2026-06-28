"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  PieChart,
  Network,
  Gauge,
  Sparkles,
  Upload,
  PencilLine,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/store/portfolio";
import { SAMPLE_PORTFOLIO } from "@/lib/sample-portfolio";

const CAPABILITIES = [
  { icon: PieChart, title: "Allocation", body: "Sector, geographic and market-cap exposure with concentration analysis." },
  { icon: Activity, title: "Performance", body: "Annualized return, volatility, Sharpe, Sortino, drawdown and rolling risk." },
  { icon: ShieldCheck, title: "Risk engine", body: "Historical VaR & Expected Shortfall, beta and per-position risk attribution." },
  { icon: Network, title: "Correlation", body: "Full pairwise correlation matrix and average correlation across holdings." },
  { icon: Gauge, title: "Scoring", body: "Transparent Health, Risk and Diversification scores with a letter grade." },
  { icon: Sparkles, title: "AI commentary", body: "Institutional narrative strictly grounded in the computed analytics." },
];

const METHODS = [
  "Herfindahl-Hirschman Index",
  "Historical VaR (95% / 99%)",
  "Conditional VaR",
  "Single-factor beta",
  "Risk contribution",
  "Rolling volatility",
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();
  const clear = usePortfolioStore((s) => s.clear);
  const addHoldings = usePortfolioStore((s) => s.addHoldings);

  const runSample = () => {
    clear();
    addHoldings(SAMPLE_PORTFOLIO);
    router.push("/dashboard");
  };

  return (
    <div className="relative overflow-hidden">
      <div className="aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] grid-texture" aria-hidden />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-10 pt-16 text-center lg:pt-24">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }}>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex justify-center">
            <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 glass">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Institutional Portfolio Analytics
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight lg:text-6xl"
          >
            Your portfolio, analyzed like a{" "}
            <span className="text-gradient">professional desk</span> would.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Upload your holdings or build them by hand, and PortfolioIQ computes
            allocation, performance, risk and diversification analytics from real
            return series — then explains them in plain, institutional language.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/portfolio">
                Build your portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={runSample} className="glass-hover">
              <Sparkles className="h-4 w-4" />
              Try a sample
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-6 text-2xs uppercase tracking-wider text-muted-foreground"
          >
            No account · Processed locally for this session · Times shown in IST
          </motion.p>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14"
        >
          <DashboardPreview />
        </motion.div>
      </section>

      {/* Two ways to start */}
      <section className="relative mx-auto max-w-5xl px-6 py-14">
        <SectionHeading eyebrow="Get started" title="Two ways to build your portfolio" center />
        <div className="grid gap-4 md:grid-cols-2">
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
      </section>

      {/* Capabilities */}
      <section className="relative mx-auto max-w-5xl px-6 py-14">
        <SectionHeading eyebrow="Capabilities" title="A full analytics desk, in the browser" center />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.05 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="glass glass-hover rounded-xl p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Methodology */}
      <section className="relative mx-auto max-w-5xl px-6 py-14 pb-24">
        <div className="glass rounded-2xl p-6 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Transparent methodology
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every metric is computed from documented formulas on real daily
                return series — no mocked calculations, no fabricated figures. The
                AI only interprets numbers it is given.
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link href="/portfolio">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
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

function SectionHeading({
  eyebrow,
  title,
  center,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mb-7 text-center" : "mb-6"}>
      <div className="text-2xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
        {title}
      </h2>
    </div>
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

/** A lightweight, static mock of the analytics dashboard for the hero. */
function DashboardPreview() {
  const bars = [62, 48, 71, 39, 84, 55, 67];
  return (
    <div className="glass mx-auto max-w-3xl rounded-2xl p-4 shadow-xl lg:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Portfolio Health
          </span>
        </div>
        <Badge variant="positive">Grade A</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Ann. Return", v: "+14.2%", tone: "text-positive" },
          { k: "Volatility", v: "16.5%", tone: "text-foreground" },
          { k: "Sharpe", v: "1.18", tone: "text-foreground" },
          { k: "VaR 95%", v: "1.9%", tone: "text-warning" },
        ].map((m) => (
          <div key={m.k} className="rounded-lg border border-border bg-surface/70 p-3 text-left">
            <div className="text-2xs uppercase tracking-wide text-muted-foreground">{m.k}</div>
            <div className={`mt-1 text-lg font-semibold tabular ${m.tone}`}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-28 items-end gap-2 rounded-lg border border-border bg-surface/70 p-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
