# PortfolioIQ

**Institutional-grade portfolio analytics platform.**

PortfolioIQ analyzes an equity portfolio the way an analytics desk would: it
computes allocation, performance, risk and diversification metrics from real
daily return series, then layers AI commentary that *interprets* the numbers
without ever inventing them. The interface is modeled on enterprise financial
software (Bloomberg, Aladdin, FactSet, Morningstar Direct) rather than a retail
trading app.

> Portfolio data is processed locally for your browser session and is never
> stored, transmitted to a database, or persisted across sessions.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Analytics methodology](#analytics-methodology)
- [The AI commentary layer](#the-ai-commentary-layer)
- [Market data](#market-data)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Future roadmap](#future-roadmap)
- [Known limitations](#known-limitations)

---

## Features

**Portfolio input**
- Manual holding entry with ticker autocomplete and validation (ticker,
  quantity and cost per share are required)
- CSV / TSV / Excel (.xlsx, .xls) import with automatic table detection and
  fuzzy header matching — the table need not start on row 1, and column labels
  are matched loosely (broker-export friendly)
- Inline editing, weighted-average position merging, sample portfolio
- Session-only persistence (sessionStorage) — no account, no database

**Experience**
- Light / dark theme toggle (institutional graphite ↔ paper-white)
- Liquid-glass surfaces, animated aurora hero and subtle motion
- Analytics view stays locked until at least one holding is added

**Analytics**
- Asset, sector, geographic and market-cap allocation
- Concentration: top-5 weight, Herfindahl-Hirschman Index, effective holdings
- Annualized return & volatility, cumulative return
- Sharpe and Sortino ratios, maximum drawdown
- Portfolio beta vs. a broad-market benchmark
- Historical Value at Risk (95% / 99%) and Conditional VaR (Expected Shortfall)
- Per-position risk and return contribution
- Full pairwise correlation matrix and average correlation
- Rolling annualized volatility
- Composite Health, Risk and Diversification scores with a letter grade

**Dashboard**
- Executive overview with composite-score gauges
- Allocation, performance, risk and correlation sections
- Interactive sector filtering on holdings
- Sortable holdings table
- Export to CSV (holdings / metrics) and JSON (full analytics)

**AI layer**
- Executive summary, risk and diversification commentary
- Strengths, weaknesses and three prioritized recommendations
- Hybrid design: deterministic by default, LLM-phrased when configured

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Next.js 15 (App Router) + React 19                 |
| Language           | TypeScript (strict, `noUncheckedIndexedAccess`)    |
| Styling            | Tailwind CSS 3 + a custom design-token theme       |
| UI primitives      | Hand-built, shadcn/ui-style components             |
| Charts             | Recharts + a custom correlation heatmap            |
| Forms & validation | React Hook Form + Zod                              |
| Tables             | TanStack Table                                     |
| CSV parsing        | PapaParse                                          |
| State              | Zustand (sessionStorage-persisted)                 |
| Market data        | Yahoo Finance (optional) with a synthetic fallback |
| AI commentary      | OpenAI-compatible API (optional)                   |
| Testing            | Vitest                                             |

---

## Architecture

PortfolioIQ follows a strict **compute-then-narrate** pipeline. The deterministic
analytics engine is the source of truth; everything else renders or interprets
its output.

```
Holdings (client, session-only)
        │  POST /api/analyze
        ▼
┌─────────────────────────────────────────────┐
│ Server                                       │
│  1. Market layer  → resolve prices + meta    │  cache · rate-limit · fallback
│  2. Analytics     → computeAnalytics()       │  pure, documented, tested
│  3. AI layer      → generateCommentary()     │  interprets #2, never invents
└─────────────────────────────────────────────┘
        │  { analytics, commentary }
        ▼
Dashboard (charts, tables, scores, commentary)
```

Key design decisions:

- **The analytics engine is pure and framework-free.** It takes plain objects
  and returns a plain `PortfolioAnalytics` object, so it is unit-testable in
  isolation and reusable by any future surface (a report generator, a CLI, etc.).
- **The market layer is an interface, not an implementation.** A provider
  abstraction selects between live Yahoo Finance and a deterministic synthetic
  source, with caching, bounded concurrency and per-ticker fallback. Adding a
  new vendor means adding one module.
- **The AI never sees raw freedom over numbers.** It receives a compact digest
  of already-computed analytics and is constrained to interpretation. If no LLM
  is configured, a deterministic generator produces the same structured output.

---

## Analytics methodology

All formulas are implemented in `src/lib/analytics/statistics.ts` and
`engine.ts`, and documented inline. A summary lives in
[`docs/METHODOLOGY.md`](docs/METHODOLOGY.md). Highlights:

- **Returns** — simple daily returns `r_t = P_t / P_{t-1} − 1`.
- **Annualized volatility** — `σ_daily · √252`.
- **Annualized return** — geometric: `(Π(1 + r_t))^(252/n) − 1`.
- **Sharpe** — `mean(excess) / std(excess) · √252`, excess over the risk-free rate.
- **Sortino** — Sharpe numerator over downside deviation only.
- **Maximum drawdown** — largest peak-to-trough decline of the equity curve.
- **Beta** — `Cov(r_p, r_m) / Var(r_m)` against a broad-market benchmark.
- **Historical VaR** — the α-quantile of the empirical loss distribution.
- **Conditional VaR** — mean loss in the tail beyond VaR.
- **HHI** — `Σ wᵢ²`; effective holdings `= 1 / HHI`.
- **Risk contribution** — `wᵢ · Cov(rᵢ, r_p) / Var(r_p)` (sums to 1).

These invariants (weights sum to 1, risk contributions sum to 1, correlation
matrix symmetric with unit diagonal, HHI = 1/n for equal weights, determinism)
are enforced by the test suite.

---

## The AI commentary layer

The commentary layer is intentionally conservative:

1. Analytics are computed **first** and deterministically.
2. A digest of those figures is passed to the model with a system prompt that
   forbids inventing or altering numbers.
3. The response is validated; on any malformed output the layer falls back to
   the deterministic generator.

This guarantees the product is fully functional — with professional, specific
commentary — even with no API key, and that any LLM phrasing is grounded in the
real computed metrics.

---

## Market data

| Provider    | When used                                  | Notes                                   |
| ----------- | ------------------------------------------ | --------------------------------------- |
| `synthetic` | Default; any time live data is unavailable | Deterministic single-factor price model |
| `yahoo`     | When `MARKET_DATA_PROVIDER=yahoo`          | 3y daily history + instrument metadata  |

The synthetic provider is **not random noise**: it uses a shared market factor
plus per-instrument beta and idiosyncratic volatility, so cross-asset
correlations, betas and sector behavior are realistic *and reproducible* — the
same ticker always yields the same history. Common tickers carry curated
sector / region / market-cap classifications; unknown tickers derive stable
pseudo-fundamentals from the symbol.

---

## Getting started

```bash
# 1. Install
npm install

# 2. (optional) configure environment
cp .env.example .env.local

# 3. Develop
npm run dev          # http://localhost:3000

# 4. Production build
npm run build && npm run start
```

Load the **sample portfolio** from the Portfolio page to explore the full
dashboard immediately.

---

## Configuration

All environment variables are optional (see `.env.example`):

| Variable                | Default               | Purpose                                  |
| ----------------------- | --------------------- | ---------------------------------------- |
| `MARKET_DATA_PROVIDER`  | `synthetic`           | `synthetic` or `yahoo`                   |
| `OPENAI_API_KEY`        | —                     | Enables LLM-phrased commentary           |
| `OPENAI_BASE_URL`       | `api.openai.com/v1`   | OpenAI-compatible endpoint               |
| `OPENAI_MODEL`          | `gpt-4o-mini`         | Model for commentary                     |

---

## Testing

```bash
npm run test       # Vitest unit tests (statistics + engine invariants)
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

---

## Deployment

PortfolioIQ targets **Vercel** with zero configuration:

1. Import the repository into Vercel.
2. (Optional) set the environment variables above.
3. Deploy. The production build must pass with no TypeScript or lint errors.

`yahoo-finance2` is marked as a server-external package so its Deno-targeted
test helpers are never bundled.

---

## Project structure

```
src/
├── app/                 # App Router: pages + API routes
│   ├── api/analyze/     # POST → analytics + commentary
│   ├── api/tickers/     # GET  → autocomplete
│   ├── dashboard/       # analytics dashboard
│   └── portfolio/       # holdings input
├── components/
│   ├── ui/              # design-system primitives
│   ├── layout/          # app shell, sidebar, top bar
│   ├── portfolio/       # input form, CSV upload, editor
│   ├── dashboard/       # sections, scores, tables, commentary
│   └── charts/          # Recharts wrappers + heatmap
├── lib/
│   ├── analytics/       # statistics + engine (+ tests)
│   ├── market/          # provider, synthetic, yahoo, instruments
│   ├── ai/              # commentary generator
│   └── ...              # formatting, validation, export, utils
├── hooks/               # useAnalytics
├── store/               # Zustand portfolio store
└── types/               # shared domain types
```

---

## Future roadmap

The architecture is deliberately modular so additional analytics can be added
as a new route + engine module without refactoring. These are intentionally not
surfaced as "coming soon" placeholders in the UI — they are documented direction
only:

- Factor-exposure / multi-factor risk model
- Monte Carlo portfolio simulator
- DCF valuation engine

---

## Known limitations

- Time-series analytics assume **constant current weights** (a standard ex-post
  simplification) rather than reconstructing historical weights from trade dates.
- The synthetic provider is realistic but not real market data; enable the Yahoo
  provider for live prices where outbound network access is available.
- VaR is one-day, historical (non-parametric) and not scaled to a horizon.
- Coverage of curated instrument metadata is limited to common large caps;
  other tickers receive stable derived classifications.
- Analysis is single-currency (USD) and equity-focused.
```
