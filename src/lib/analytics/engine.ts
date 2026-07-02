/**
 * The PortfolioIQ analytics engine.
 *
 * Given a set of holdings resolved against market data, this module computes
 * the full, deterministic `PortfolioAnalytics` object consumed by the
 * dashboard and the AI commentary layer. Every figure here is derived from
 * the statistical primitives in `statistics.ts`; nothing is mocked.
 *
 * Pipeline:
 *   1. Value positions and derive weights.
 *   2. Align price histories on common trading days.
 *   3. Compute per-asset and portfolio return series.
 *   4. Derive performance, risk, allocation and diversification analytics.
 *   5. Roll up composite scores (health / risk / diversification).
 */

import type {
  AllocationSlice,
  ContributionRow,
  CorrelationMatrix,
  Holding,
  InstrumentData,
  PortfolioAnalytics,
  ResolvedPosition,
  RollingPoint,
} from "@/types";
import { clamp } from "@/lib/utils";
import { todayInIST } from "@/lib/format";
import {
  classifyAssetClass,
  classifyEquityCategory,
  classifyFundCategory,
} from "./asset-class";
import {
  TRADING_DAYS_PER_YEAR,
  annualizedReturn,
  annualizedVolatility,
  beta,
  conditionalVaR,
  correlation,
  cumulativeReturn,
  herfindahl,
  historicalVaR,
  maxDrawdown,
  sharpeRatio,
  sortinoRatio,
  stdDev,
  toReturns,
  variance,
} from "./statistics";

/** Default annual risk-free rate used for risk-adjusted ratios. */
export const DEFAULT_RISK_FREE_RATE = 0.043;
const ROLLING_WINDOW = 21; // ~1 trading month

export interface EngineInput {
  holdings: Holding[];
  instruments: Record<string, InstrumentData>;
  /** Benchmark daily close history (e.g. S&P 500 proxy). */
  benchmarkHistory: { date: string; close: number }[];
  riskFreeRate?: number;
  /** Display currency for the analysis (default INR). */
  currency?: string;
}

/** Intersect the trading days available across all instruments + benchmark. */
function alignReturns(
  positions: ResolvedPosition[],
  benchmarkHistory: { date: string; close: number }[],
): {
  dates: string[];
  assetReturns: Record<string, number[]>;
  benchmarkReturns: number[];
} {
  const priceMaps = positions.map((p) => {
    const m = new Map<string, number>();
    for (const pt of p.data.history) m.set(pt.date, pt.close);
    return { ticker: p.data.meta.ticker, map: m };
  });
  const benchMap = new Map<string, number>();
  for (const pt of benchmarkHistory) benchMap.set(pt.date, pt.close);

  // Common dates = intersection of every series, in ascending order.
  const allDates = benchmarkHistory.map((p) => p.date).sort();
  const commonDates = allDates.filter(
    (d) => benchMap.has(d) && priceMaps.every((pm) => pm.map.has(d)),
  );

  const assetReturns: Record<string, number[]> = {};
  for (const pm of priceMaps) {
    const prices = commonDates.map((d) => pm.map.get(d)!);
    assetReturns[pm.ticker] = toReturns(prices);
  }
  const benchmarkReturns = toReturns(commonDates.map((d) => benchMap.get(d)!));
  // Returns drop the first date.
  return { dates: commonDates.slice(1), assetReturns, benchmarkReturns };
}

function buildAllocation(
  positions: ResolvedPosition[],
  keyFn: (p: ResolvedPosition) => string,
): AllocationSlice[] {
  const total = positions.reduce((s, p) => s + p.marketValue, 0);
  const groups = new Map<string, number>();
  for (const p of positions) {
    const key = keyFn(p);
    groups.set(key, (groups.get(key) ?? 0) + p.marketValue);
  }
  return Array.from(groups.entries())
    .map(([label, value]) => ({
      label,
      value,
      weight: total > 0 ? value / total : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildCorrelation(
  tickers: string[],
  assetReturns: Record<string, number[]>,
): CorrelationMatrix {
  const matrix = tickers.map((ti) =>
    tickers.map((tj) =>
      ti === tj ? 1 : correlation(assetReturns[ti] ?? [], assetReturns[tj] ?? []),
    ),
  );
  return { tickers, matrix };
}

function averageCorrelation(m: CorrelationMatrix): number {
  const n = m.tickers.length;
  if (n < 2) return 0;
  let acc = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      acc += m.matrix[i]![j]!;
      count++;
    }
  }
  return count > 0 ? acc / count : 0;
}

function buildRolling(portfolioReturns: number[], dates: string[]): RollingPoint[] {
  const out: RollingPoint[] = [];
  let cumulative = 1;
  for (let t = 0; t < portfolioReturns.length; t++) {
    cumulative *= 1 + portfolioReturns[t]!;
    if (t >= ROLLING_WINDOW - 1) {
      const window = portfolioReturns.slice(t - ROLLING_WINDOW + 1, t + 1);
      out.push({
        date: dates[t] ?? "",
        volatility: stdDev(window) * Math.sqrt(TRADING_DAYS_PER_YEAR),
        cumulativeReturn: cumulative - 1,
      });
    }
  }
  return out;
}

/**
 * Risk and return contribution.
 *   Risk contribution_i = w_i · Cov(r_i, r_p) / Var(r_p)
 *   (these sum to 1 across positions by construction).
 *   Return contribution_i = w_i · annualizedReturn_i / Σ w·return.
 */
function buildContribution(
  positions: ResolvedPosition[],
  assetReturns: Record<string, number[]>,
  portfolioReturns: number[],
): ContributionRow[] {
  const varP = variance(portfolioReturns);
  const rawReturnContrib = positions.map((p) => {
    const r = assetReturns[p.data.meta.ticker] ?? [];
    return p.weight * annualizedReturn(r);
  });
  const totalReturnContrib = rawReturnContrib.reduce((s, v) => s + v, 0);

  return positions.map((p, idx) => {
    const r = assetReturns[p.data.meta.ticker] ?? [];
    // Covariance of asset with portfolio, aligned on shared length.
    const n = Math.min(r.length, portfolioReturns.length);
    let cov = 0;
    if (n >= 2 && varP > 0) {
      const ra = r.slice(r.length - n);
      const rp = portfolioReturns.slice(portfolioReturns.length - n);
      const ma = ra.reduce((s, v) => s + v, 0) / n;
      const mp = rp.reduce((s, v) => s + v, 0) / n;
      let acc = 0;
      for (let i = 0; i < n; i++) acc += (ra[i]! - ma) * (rp[i]! - mp);
      cov = acc / (n - 1);
    }
    return {
      ticker: p.data.meta.ticker,
      weight: p.weight,
      volatility: annualizedVolatility(r),
      riskContribution: varP > 0 ? (p.weight * cov) / varP : 0,
      returnContribution:
        totalReturnContrib !== 0 ? rawReturnContrib[idx]! / totalReturnContrib : 0,
    };
  });
}

/** Diversification score: blends count, concentration and correlation. */
function diversificationScore(
  hhi: number,
  holdingsCount: number,
  sectorCount: number,
  avgCorrelation: number,
): number {
  // Effective-holdings component: reward 1/HHI up to ~20 names.
  const effective = hhi > 0 ? 1 / hhi : 0;
  const effComponent = clamp(effective / 20, 0, 1); // 0..1
  // Sector breadth: 11 GICS sectors available.
  const sectorComponent = clamp(sectorCount / 8, 0, 1);
  // Low average correlation is good for diversification.
  const corrComponent = clamp(1 - (avgCorrelation + 0.2) / 1.2, 0, 1);
  const countComponent = clamp(holdingsCount / 15, 0, 1);
  const score =
    100 *
    (0.4 * effComponent +
      0.25 * sectorComponent +
      0.2 * corrComponent +
      0.15 * countComponent);
  return Math.round(clamp(score, 0, 100));
}

/** Risk score: higher = riskier. Blends volatility, drawdown, VaR, beta. */
function riskScore(
  annVol: number,
  maxDd: number,
  var95: number,
  portfolioBeta: number,
): number {
  const volComponent = clamp(annVol / 0.4, 0, 1); // 40% vol -> max
  const ddComponent = clamp(maxDd / 0.6, 0, 1); // 60% drawdown -> max
  const varComponent = clamp(var95 / 0.06, 0, 1); // 6% daily VaR -> max
  const betaComponent = clamp(Math.abs(portfolioBeta) / 2, 0, 1);
  const score =
    100 *
    (0.35 * volComponent +
      0.25 * ddComponent +
      0.25 * varComponent +
      0.15 * betaComponent);
  return Math.round(clamp(score, 0, 100));
}

export function computeAnalytics(input: EngineInput): PortfolioAnalytics {
  const rf = input.riskFreeRate ?? DEFAULT_RISK_FREE_RATE;
  const warnings: string[] = [];

  // --- 1. Value positions & weights ---------------------------------------
  const valued = input.holdings
    .map((holding) => {
      const data = input.instruments[holding.ticker];
      if (!data) {
        warnings.push(`No market data resolved for ${holding.ticker}.`);
        return null;
      }
      const marketValue = holding.quantity * data.lastPrice;
      return { holding, data, marketValue };
    })
    .filter((v): v is { holding: Holding; data: InstrumentData; marketValue: number } => v !== null);

  const totalValue = valued.reduce((s, v) => s + v.marketValue, 0);

  const positions: ResolvedPosition[] = valued.map((v) => {
    const weight = totalValue > 0 ? v.marketValue / totalValue : 0;
    let unrealizedGain: number | undefined;
    let unrealizedReturn: number | undefined;
    if (v.holding.purchasePrice && v.holding.purchasePrice > 0) {
      const cost = v.holding.purchasePrice * v.holding.quantity;
      unrealizedGain = v.marketValue - cost;
      unrealizedReturn = cost > 0 ? unrealizedGain / cost : undefined;
    }
    return {
      holding: v.holding,
      data: v.data,
      marketValue: v.marketValue,
      weight,
      unrealizedGain,
      unrealizedReturn,
    };
  });

  const totalCostPositions = positions.filter(
    (p) => p.holding.purchasePrice && p.holding.purchasePrice > 0,
  );
  const totalCost =
    totalCostPositions.length === positions.length && positions.length > 0
      ? positions.reduce(
          (s, p) => s + (p.holding.purchasePrice ?? 0) * p.holding.quantity,
          0,
        )
      : undefined;
  const totalUnrealizedGain =
    totalCost !== undefined ? totalValue - totalCost : undefined;
  const totalUnrealizedReturn =
    totalCost !== undefined && totalCost > 0
      ? totalUnrealizedGain! / totalCost
      : undefined;

  // --- 2. Align returns ----------------------------------------------------
  const { dates, assetReturns, benchmarkReturns } = alignReturns(
    positions,
    input.benchmarkHistory,
  );
  if (dates.length < ROLLING_WINDOW) {
    warnings.push(
      "Overlapping price history is short; time-series metrics use the available window.",
    );
  }

  // --- 3. Portfolio return series (constant current weights) ---------------
  const length = Math.min(
    ...positions.map((p) => assetReturns[p.data.meta.ticker]?.length ?? 0),
    benchmarkReturns.length,
  );
  const safeLength = Number.isFinite(length) && length > 0 ? length : 0;
  const portfolioReturns: number[] = new Array(safeLength).fill(0);
  for (const p of positions) {
    const series = assetReturns[p.data.meta.ticker] ?? [];
    const offset = series.length - safeLength;
    for (let t = 0; t < safeLength; t++) {
      portfolioReturns[t] = portfolioReturns[t]! + p.weight * series[offset + t]!;
    }
  }
  const benchAligned = benchmarkReturns.slice(benchmarkReturns.length - safeLength);
  const rollingDates = dates.slice(dates.length - safeLength);

  // --- 4. Performance ------------------------------------------------------
  const annVol = annualizedVolatility(portfolioReturns);
  const annReturn = annualizedReturn(portfolioReturns);
  const equityCurve: { date: string; value: number }[] = [];
  {
    let equity = totalValue || 1;
    const base = totalValue || 1;
    equityCurve.push({ date: rollingDates[0] ?? input.holdings[0]?.id ?? "", value: base });
    for (let t = 0; t < portfolioReturns.length; t++) {
      equity *= 1 + portfolioReturns[t]!;
      equityCurve.push({ date: rollingDates[t] ?? `${t}`, value: equity });
    }
  }

  // Guard every scalar against NaN/Infinity (degenerate series, zero variance):
  // a non-finite value would serialize to null over JSON and surface as a blank
  // score/metric in the UI.
  const finite = (v: number, fallback = 0) => (Number.isFinite(v) ? v : fallback);

  const performance = {
    annualizedReturn: finite(annReturn),
    annualizedVolatility: finite(annVol),
    cumulativeReturn: finite(cumulativeReturn(portfolioReturns)),
    sharpeRatio: finite(sharpeRatio(portfolioReturns, rf)),
    sortinoRatio: finite(sortinoRatio(portfolioReturns, rf)),
    maxDrawdown: finite(maxDrawdown(portfolioReturns)),
    beta: finite(beta(portfolioReturns, benchAligned)),
    observations: portfolioReturns.length,
    equityCurve,
    rolling: buildRolling(portfolioReturns, rollingDates),
  };

  // --- 5. Risk -------------------------------------------------------------
  const correlationMatrix = buildCorrelation(
    positions.map((p) => p.data.meta.ticker),
    assetReturns,
  );
  const risk = {
    valueAtRisk95: finite(historicalVaR(portfolioReturns, 0.95)),
    valueAtRisk99: finite(historicalVaR(portfolioReturns, 0.99)),
    conditionalVaR95: finite(conditionalVaR(portfolioReturns, 0.95)),
    annualizedVolatility: finite(annVol),
    contribution: buildContribution(positions, assetReturns, portfolioReturns),
    correlation: correlationMatrix,
    averageCorrelation: finite(averageCorrelation(correlationMatrix)),
  };

  // --- 6. Allocation -------------------------------------------------------
  const equityPositions = positions.filter(
    (p) => classifyAssetClass(p.holding.ticker, p.holding.isin) === "Equity",
  );
  const fundPositions = positions.filter(
    (p) => classifyAssetClass(p.holding.ticker, p.holding.isin) === "Mutual Fund",
  );

  const allocation = {
    byAssetClass: buildAllocation(positions, (p) =>
      classifyAssetClass(p.holding.ticker, p.holding.isin),
    ),
    byEquityCategory: buildAllocation(equityPositions, (p) =>
      classifyEquityCategory(p.holding.ticker),
    ),
    byFundCategory: buildAllocation(fundPositions, (p) =>
      classifyFundCategory(p.holding.ticker),
    ),
    bySector: buildAllocation(positions, (p) => p.data.meta.sector),
    byRegion: buildAllocation(positions, (p) => p.data.meta.region),
    byMarketCap: buildAllocation(positions, (p) => p.data.meta.marketCapBucket),
    byHolding: buildAllocation(positions, (p) => p.data.meta.ticker),
  };

  // --- 7. Diversification --------------------------------------------------
  const weights = positions.map((p) => p.weight);
  const hhi = herfindahl(weights);
  const sortedWeights = [...weights].sort((a, b) => b - a);
  const concentrationTop5 = sortedWeights.slice(0, 5).reduce((s, w) => s + w, 0);
  const sectorCount = allocation.bySector.filter((s) => s.label !== "Unknown").length;
  const divScore = diversificationScore(
    hhi,
    positions.length,
    sectorCount,
    risk.averageCorrelation,
  );
  const diversification = {
    hhi,
    effectiveHoldings: hhi > 0 ? 1 / hhi : 0,
    concentrationTop5,
    score: divScore,
    holdingsCount: positions.length,
    sectorCount,
  };

  // --- 8. Composite scores -------------------------------------------------
  const rScore = riskScore(
    annVol,
    performance.maxDrawdown,
    risk.valueAtRisk95,
    performance.beta,
  );
  // Health blends risk-adjusted performance, diversification and moderate risk.
  const sharpeComponent = clamp((performance.sharpeRatio + 0.5) / 2.5, 0, 1);
  const ddComponent = clamp(1 - performance.maxDrawdown / 0.5, 0, 1);
  const health = Math.round(
    clamp(
      100 *
        (0.35 * sharpeComponent +
          0.3 * (divScore / 100) +
          0.2 * ddComponent +
          0.15 * (1 - rScore / 100)),
      0,
      100,
    ),
  );

  if (concentrationTop5 > 0.7 && positions.length > 1) {
    warnings.push("Top 5 holdings exceed 70% of the portfolio — high concentration.");
  }
  if (risk.averageCorrelation > 0.7 && positions.length > 2) {
    warnings.push("Average pairwise correlation is high — limited diversification benefit.");
  }

  return {
    asOf: todayInIST(),
    baseCurrency: input.currency ?? "INR",
    totalValue,
    totalCost,
    totalUnrealizedGain,
    totalUnrealizedReturn,
    positions,
    allocation,
    performance,
    risk,
    diversification,
    scores: {
      health,
      risk: rScore,
      diversification: divScore,
    },
    warnings,
  };
}
