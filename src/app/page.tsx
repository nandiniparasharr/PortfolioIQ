"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  PieChart,
  Network,
  Gauge,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AboutSection } from "@/components/sections/about-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { AnalyzeSection } from "@/components/sections/analyze-section";
import { BehindSection } from "@/components/sections/behind-section";

const CAPABILITIES = [
  { icon: PieChart, title: "Allocation", body: "Sector, geographic and market-cap exposure with concentration analysis." },
  { icon: Activity, title: "Performance", body: "Annualized return, volatility, Sharpe, Sortino, drawdown and rolling risk." },
  { icon: ShieldCheck, title: "Risk engine", body: "Historical VaR & Expected Shortfall, beta and per-position risk attribution." },
  { icon: Network, title: "Correlation", body: "Full pairwise correlation matrix and average correlation across holdings." },
  { icon: Gauge, title: "Scoring", body: "Transparent Health, Risk and Diversification scores rolled up from documented metrics." },
  { icon: Sparkles, title: "AI commentary", body: "Clear narrative strictly grounded in the computed analytics." },
];

const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
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
              Portfolio Analytics
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl"
          >
            Your portfolio, analyzed like a{" "}
            <span className="hero-accent">professional desk</span> would.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Upload your holdings or build them by hand, and PortfolioIQ computes
            allocation, performance, risk and diversification analytics from real
            return series — then explains them in plain language.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/portfolio">
                Analyze your portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-hover">
              <Link href="#how-it-works">
                See how it works
              </Link>
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-6 text-2xs uppercase tracking-wider text-muted-foreground"
          >
            No account required · No data stored
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14"
        >
          <DashboardPreview />
        </motion.div>
      </section>

      {/* Capabilities */}
      <section className="relative mx-auto max-w-5xl px-6 py-14">
        <div className="mb-7 text-center">
          <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
            Capabilities
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            A full analytics desk, in the browser
          </h2>
        </div>
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

      {/* Scrolling sections — order matches the nav tabs. */}
      <AboutSection />
      <HowItWorksSection />
      <AnalyzeSection />
      <BehindSection />
    </div>
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
          <span className="text-sm font-semibold tracking-tight text-foreground">Portfolio Health</span>
        </div>
        <Badge variant="positive">82 / 100</Badge>
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
