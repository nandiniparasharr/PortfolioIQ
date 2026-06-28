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
  LineChart,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/store/portfolio";
import { SAMPLE_PORTFOLIO } from "@/lib/sample-portfolio";

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

const STATS = [
  { value: "20+", label: "Risk & return metrics" },
  { value: "95 / 99%", label: "Historical VaR + CVaR" },
  { value: "0", label: "Fabricated numbers" },
  { value: "100%", label: "Session-only, private" },
];

const STEPS = [
  {
    icon: Upload,
    title: "Add your holdings",
    body: "Enter positions manually or import a CSV / Excel export — the table is auto-detected.",
  },
  {
    icon: LineChart,
    title: "Compute analytics",
    body: "A deterministic engine resolves market data and computes every metric from real return series.",
  },
  {
    icon: Wand2,
    title: "Read the narrative",
    body: "An institutional AI layer interprets the computed numbers into a clear, actionable brief.",
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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
      {/* Ambient aurora + grid behind the hero */}
      <div className="aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] grid-texture" aria-hidden />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 lg:pt-28">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }}>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge
              variant="secondary"
              className="mb-5 inline-flex items-center gap-1.5 glass"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Institutional Portfolio Analytics
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight lg:text-6xl"
          >
            Analyze any equity portfolio with{" "}
            <span className="text-gradient">institutional-grade</span> rigor.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            PortfolioIQ computes allocation, performance, risk and diversification
            analytics from real return series — then layers AI commentary that
            interprets the numbers without ever inventing them.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/portfolio">
                Build a portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={runSample} className="glass-hover">
              <Sparkles className="h-4 w-4" />
              Try a sample portfolio
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-6 text-2xs uppercase tracking-wider text-muted-foreground"
          >
            No account required · Data processed locally for this session · Not stored
          </motion.p>
        </motion.div>

        {/* Stats band */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="glass rounded-lg p-4"
            >
              <div className="text-2xl font-semibold tracking-tight tabular">{s.value}</div>
              <div className="mt-0.5 text-2xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Capabilities */}
      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <SectionHeading
          eyebrow="Capabilities"
          title="A full analytics desk, in the browser"
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="glass glass-hover rounded-lg p-6"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <SectionHeading eyebrow="Workflow" title="From positions to a portfolio brief" />
        <div className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-lg p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-2xl font-semibold text-muted-foreground/30 tabular">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Methodology */}
      <section className="relative mx-auto max-w-6xl px-6 py-12 pb-24">
        <div className="glass rounded-xl p-6 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h2 className="text-xl font-semibold tracking-tight">
                Transparent methodology
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every metric is computed from documented formulas on real daily
                return series. No mocked calculations, no fabricated figures — the
                methodology is published alongside the results.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5 glass-hover">
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

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight lg:text-2xl">{title}</h2>
    </div>
  );
}
