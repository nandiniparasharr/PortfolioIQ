import type { InstrumentData, InstrumentMeta, PricePoint } from "@/types";
import { TRADING_DAYS_PER_YEAR } from "@/lib/analytics/statistics";
import {
  bucketForMarketCap,
  getSeed,
  type InstrumentSeed,
} from "./instruments";

/**
 * Deterministic, reproducible synthetic market data.
 *
 * Prices follow a single-factor model:
 *   r_i,t = drift_i/252 + beta_i · f_t + ε_i,t
 * where f_t is a shared market factor (seeded once) and ε is idiosyncratic
 * Gaussian noise. This induces a realistic cross-asset correlation structure
 * (driven by shared beta) while remaining fully deterministic — the same
 * ticker always yields the same history, so analytics are reproducible.
 */

const HISTORY_DAYS = 756; // ~3 trading years
const MARKET_FACTOR_VOL = 0.0085; // daily
const MARKET_FACTOR_DRIFT = 0.08 / TRADING_DAYS_PER_YEAR;

/** mulberry32 PRNG — fast, deterministic, good enough for simulation. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller transform: two uniforms -> one standard normal. */
function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generate the shared market factor once (cached). */
let marketFactorCache: number[] | null = null;
function marketFactor(): number[] {
  if (marketFactorCache) return marketFactorCache;
  const rng = mulberry32(0x5eed1dea);
  const out: number[] = [];
  for (let t = 0; t < HISTORY_DAYS; t++) {
    out.push(MARKET_FACTOR_DRIFT + MARKET_FACTOR_VOL * gaussian(rng));
  }
  marketFactorCache = out;
  return out;
}

/** Build trading-day dates ending today (weekdays only, approximate). */
function tradingDates(count: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  while (dates.length < count) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return dates.reverse();
}

let datesCache: string[] | null = null;
function getDates(): string[] {
  if (!datesCache) datesCache = tradingDates(HISTORY_DAYS);
  return datesCache;
}

/** Derive stable pseudo-fundamentals for a ticker not in the catalog. */
function deriveSeed(ticker: string): InstrumentSeed {
  const t = ticker.toUpperCase();
  const h = hashString(t);
  const rng = mulberry32(h);
  const sectors: InstrumentMeta["sector"][] = [
    "Information Technology",
    "Financials",
    "Health Care",
    "Consumer Discretionary",
    "Communication Services",
    "Industrials",
    "Consumer Staples",
    "Energy",
    "Utilities",
    "Real Estate",
    "Materials",
  ];
  const regions: InstrumentMeta["region"][] = [
    "North America",
    "Europe",
    "Asia Pacific",
    "Latin America",
  ];
  const sector = sectors[Math.floor(rng() * sectors.length)]!;
  const region = regions[Math.floor(rng() * regions.length)]!;
  const marketCap = 5e8 + rng() * 5e11;
  return {
    ticker: t,
    name: `${t} Holdings`,
    sector,
    industry: `${sector} — Diversified`,
    region,
    country: region === "North America" ? "United States" : "International",
    marketCap,
    marketCapBucket: bucketForMarketCap(marketCap),
    currency: "USD",
    referencePrice: 20 + rng() * 480,
    annualDrift: 0.03 + rng() * 0.18,
    annualVol: 0.16 + rng() * 0.3,
    beta: 0.6 + rng() * 1.1,
  };
}

function seedFor(ticker: string): InstrumentSeed {
  return getSeed(ticker) ?? deriveSeed(ticker);
}

function metaFromSeed(seed: InstrumentSeed): InstrumentMeta {
  const { annualDrift: _d, annualVol: _v, beta: _b, referencePrice: _p, ...meta } = seed;
  return meta;
}

/**
 * Build a deterministic price history for one instrument.
 *
 * When `anchorPrice` (the user's cost basis) is provided, the modeled current
 * price is anchored to it via a bounded, deterministic total return. This keeps
 * market value and unrealized P&L realistic relative to what the user actually
 * paid — instead of comparing their cost against an unrelated random price,
 * which produced absurd figures like +921% or -98%.
 */
export function syntheticInstrument(ticker: string, anchorPrice?: number): InstrumentData {
  const seed = seedFor(ticker);
  const factor = marketFactor();
  const dates = getDates();
  const rng = mulberry32(hashString(seed.ticker) ^ 0x9e3779b9);

  let referenceTarget = seed.referencePrice;
  if (anchorPrice && anchorPrice > 0) {
    const rrng = mulberry32(hashString(seed.ticker) ^ 0x85ebca6b);
    const totalReturn = -0.35 + rrng() * 1.2; // bounded -35% .. +85%
    referenceTarget = anchorPrice * (1 + totalReturn);
  }

  const dailyDrift = seed.annualDrift / TRADING_DAYS_PER_YEAR;
  const idioVol = seed.annualVol / Math.sqrt(TRADING_DAYS_PER_YEAR);

  // Work backwards from the reference (current) price so lastPrice is stable.
  const returns: number[] = [];
  for (let t = 0; t < HISTORY_DAYS; t++) {
    const r = dailyDrift + seed.beta * factor[t]! + idioVol * gaussian(rng);
    returns.push(r);
  }
  const history: PricePoint[] = [];
  // Reconstruct prices so the final close equals referencePrice.
  let cumulative = 1;
  const factors: number[] = [1];
  for (let t = 0; t < returns.length; t++) {
    cumulative *= 1 + returns[t]!;
    factors.push(cumulative);
  }
  const finalFactor = factors[factors.length - 1]!;
  const startPrice = referenceTarget / finalFactor;
  for (let t = 0; t < dates.length; t++) {
    history.push({
      date: dates[t]!,
      close: Number((startPrice * factors[t]!).toFixed(2)),
    });
  }
  const lastPrice = history[history.length - 1]?.close ?? referenceTarget;

  return { meta: metaFromSeed(seed), lastPrice, history };
}

/**
 * Synthetic benchmark proxy (broad market index).
 *
 * Reconstructed with the SAME prefix-product convention as instruments
 * (close[t] = base · Π_{k<t}(1 + factor_k)), so day t of the benchmark and day
 * t of every instrument both reference factor_t. Using an in-place `level *=`
 * loop here would shift the benchmark one day relative to assets and collapse
 * the shared-factor correlation (and portfolio beta) toward zero.
 */
export function syntheticBenchmark(): { date: string; close: number }[] {
  const factor = marketFactor();
  const dates = getDates();
  const base = 4500;
  let cumulative = 1;
  const out: { date: string; close: number }[] = [
    { date: dates[0]!, close: base },
  ];
  for (let t = 1; t < dates.length; t++) {
    cumulative *= 1 + factor[t - 1]!;
    out.push({ date: dates[t]!, close: Number((base * cumulative).toFixed(2)) });
  }
  return out;
}
