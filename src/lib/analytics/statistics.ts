/**
 * Pure statistical and financial-math primitives.
 *
 * These functions operate on plain number arrays so they can be unit-tested
 * without any market-data or React dependencies. Every function documents the
 * formula it implements. There are no mocked or fabricated results — given the
 * same inputs they return the same mathematically-defined outputs.
 *
 * Convention: a "simple return" series r_t = P_t / P_{t-1} - 1.
 */

/** Number of trading days used to annualize daily statistics. */
export const TRADING_DAYS_PER_YEAR = 252;

/** Arithmetic mean. Returns 0 for an empty series. */
export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let sum = 0;
  for (const x of xs) sum += x;
  return sum / xs.length;
}

/**
 * Sample variance (Bessel-corrected, divisor n-1).
 * Var = (1 / (n-1)) * Σ (x_i - x̄)²
 */
export function variance(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = mean(xs);
  let acc = 0;
  for (const x of xs) acc += (x - m) ** 2;
  return acc / (n - 1);
}

/** Sample standard deviation = √variance. */
export function stdDev(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

/**
 * Sample covariance of two equal-length series (divisor n-1).
 * Cov = (1 / (n-1)) * Σ (x_i - x̄)(y_i - ȳ)
 */
export function covariance(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let acc = 0;
  for (let i = 0; i < n; i++) acc += (xs[i]! - mx) * (ys[i]! - my);
  return acc / (n - 1);
}

/**
 * Pearson correlation coefficient ρ = Cov(x,y) / (σ_x · σ_y).
 * Returns 0 when either series has zero variance.
 */
export function correlation(xs: number[], ys: number[]): number {
  const sx = stdDev(xs);
  const sy = stdDev(ys);
  if (sx === 0 || sy === 0) return 0;
  return covariance(xs, ys) / (sx * sy);
}

/** Convert an ascending price series into simple daily returns. */
export function toReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1]!;
    if (prev > 0) out.push(prices[i]! / prev - 1);
  }
  return out;
}

/**
 * Annualized volatility = σ_daily · √252, where σ_daily is the sample
 * standard deviation of daily simple returns.
 */
export function annualizedVolatility(dailyReturns: number[]): number {
  return stdDev(dailyReturns) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

/**
 * Geometric annualized return (CAGR-style) from a daily return series.
 *   total = Π (1 + r_t)
 *   annualized = total^(252 / n) - 1
 */
export function annualizedReturn(dailyReturns: number[]): number {
  const n = dailyReturns.length;
  if (n === 0) return 0;
  let total = 1;
  for (const r of dailyReturns) total *= 1 + r;
  if (total <= 0) return -1;
  return total ** (TRADING_DAYS_PER_YEAR / n) - 1;
}

/** Cumulative compounded return over the series: Π(1 + r_t) - 1. */
export function cumulativeReturn(dailyReturns: number[]): number {
  let total = 1;
  for (const r of dailyReturns) total *= 1 + r;
  return total - 1;
}

/**
 * Sharpe ratio on excess returns, annualized.
 *   daily excess = r_t - rf_daily
 *   Sharpe = mean(excess) / std(excess) · √252
 * rfAnnual is the annual risk-free rate (e.g. 0.04).
 */
export function sharpeRatio(dailyReturns: number[], rfAnnual: number): number {
  if (dailyReturns.length < 2) return 0;
  const rfDaily = rfAnnual / TRADING_DAYS_PER_YEAR;
  const excess = dailyReturns.map((r) => r - rfDaily);
  const sd = stdDev(excess);
  if (sd === 0) return 0;
  return (mean(excess) / sd) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

/**
 * Sortino ratio: like Sharpe but penalizes only downside deviation.
 *   downsideDev = √(mean(min(0, r_t - rf_daily)²))
 */
export function sortinoRatio(dailyReturns: number[], rfAnnual: number): number {
  if (dailyReturns.length < 2) return 0;
  const rfDaily = rfAnnual / TRADING_DAYS_PER_YEAR;
  const excess = dailyReturns.map((r) => r - rfDaily);
  let downAcc = 0;
  let downCount = 0;
  for (const e of excess) {
    if (e < 0) {
      downAcc += e * e;
      downCount++;
    }
  }
  if (downCount === 0) return 0;
  const downsideDev = Math.sqrt(downAcc / downCount);
  if (downsideDev === 0) return 0;
  return (mean(excess) / downsideDev) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

/**
 * Maximum drawdown of an equity curve built from a return series.
 * Returns a positive fraction, e.g. 0.32 means a 32% peak-to-trough decline.
 */
export function maxDrawdown(dailyReturns: number[]): number {
  let equity = 1;
  let peak = 1;
  let maxDd = 0;
  for (const r of dailyReturns) {
    equity *= 1 + r;
    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

/**
 * Portfolio beta versus a benchmark: β = Cov(r_p, r_m) / Var(r_m).
 */
export function beta(portfolioReturns: number[], marketReturns: number[]): number {
  const varM = variance(marketReturns);
  if (varM === 0) return 0;
  return covariance(portfolioReturns, marketReturns) / varM;
}

/**
 * Historical (non-parametric) Value at Risk.
 * Returns a positive number representing the loss at the given confidence.
 * VaR_α is the α-quantile of the loss distribution (-returns).
 */
export function historicalVaR(dailyReturns: number[], confidence: number): number {
  if (dailyReturns.length === 0) return 0;
  const losses = dailyReturns.map((r) => -r).sort((a, b) => a - b);
  const idx = Math.min(
    losses.length - 1,
    Math.max(0, Math.ceil(confidence * losses.length) - 1),
  );
  return Math.max(0, losses[idx]!);
}

/**
 * Conditional VaR (Expected Shortfall): the mean loss in the tail beyond VaR.
 */
export function conditionalVaR(dailyReturns: number[], confidence: number): number {
  if (dailyReturns.length === 0) return 0;
  const losses = dailyReturns.map((r) => -r).sort((a, b) => a - b);
  const cutoff = Math.ceil(confidence * losses.length) - 1;
  const tail = losses.slice(Math.max(0, cutoff));
  if (tail.length === 0) return 0;
  return Math.max(0, mean(tail));
}

/**
 * Build a weighted portfolio return series from per-asset aligned returns.
 * Assumes constant weights (a standard simplifying assumption for ex-post
 * analytics on a current snapshot of weights).
 */
export function weightedReturns(
  assetReturns: number[][],
  weights: number[],
): number[] {
  if (assetReturns.length === 0) return [];
  const length = Math.min(...assetReturns.map((r) => r.length));
  const out: number[] = new Array(length).fill(0);
  for (let a = 0; a < assetReturns.length; a++) {
    const w = weights[a] ?? 0;
    const series = assetReturns[a]!;
    const offset = series.length - length; // align to the most recent `length`
    for (let t = 0; t < length; t++) {
      out[t] = out[t]! + w * series[offset + t]!;
    }
  }
  return out;
}

/**
 * Herfindahl-Hirschman Index of a weight vector: HHI = Σ w_i².
 * Ranges from 1/n (perfectly equal) to 1 (single holding).
 */
export function herfindahl(weights: number[]): number {
  let acc = 0;
  for (const w of weights) acc += w * w;
  return acc;
}
