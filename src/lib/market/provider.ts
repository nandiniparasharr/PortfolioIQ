import "server-only";
import type { InstrumentData } from "@/types";
import { syntheticBenchmark, syntheticInstrument } from "./synthetic";
import { classifyAssetClass } from "@/lib/analytics/asset-class";

/**
 * Server-side market-data orchestrator.
 *
 * Pricing priority per position:
 *   1. user-supplied current price (most authoritative)
 *   2. a live quote from Yahoo (real market price), when reachable
 *   3. the cost basis (shown "at cost" — never a fabricated figure)
 *
 * Only the latest price is fetched live; the synthetic price *history* still
 * drives the date-aligned time-series analytics. Results are cached in-process
 * and a circuit breaker disables live fetches for a minute after a network
 * failure so a blocked/unreachable upstream doesn't slow every request.
 */

const TTL_MS = 1000 * 60 * 30; // 30 minutes
const MAX_CONCURRENCY = 4;
const BREAKER_MS = 60 * 1000;

export interface PriceHint {
  current?: number;
  cost?: number;
  isin?: string;
}

interface CacheEntry {
  data: InstrumentData;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
let yahooDisabledUntil = 0;
let yahooConsecutiveFails = 0;

function isLivePricingEnabled(): boolean {
  // Live by default; set MARKET_DATA_PROVIDER=synthetic to force offline data.
  return (process.env.MARKET_DATA_PROVIDER ?? "live").toLowerCase() !== "synthetic";
}

/**
 * Known Indian ETFs that must be priced at their EXCHANGE price (Yahoo), never
 * as an AMFI NAV — even when a broker statement lists them by full scheme name.
 * Keyed by ISIN and by an alphanumeric key, so "HNGSNGBEES", "HNGSNG BEES" and
 * "Nippon India ETF Hang Seng BeES" all resolve to the correct trading symbol.
 */
const ETF_BY_ISIN: Record<string, string> = {
  INF204KB19I1: "HNGSNGBEES.NS", // Nippon India ETF Hang Seng BeES
};
const ETF_BY_KEY: Record<string, string> = {
  HNGSNGBEES: "HNGSNGBEES.NS",
  NIFTYBEES: "NIFTYBEES.NS",
  BANKBEES: "BANKBEES.NS",
  JUNIORBEES: "JUNIORBEES.NS",
  GOLDBEES: "GOLDBEES.NS",
  SILVERBEES: "SILVERBEES.NS",
  ITBEES: "ITBEES.NS",
  PSUBNKBEES: "PSUBNKBEES.NS",
  LIQUIDBEES: "LIQUIDBEES.NS",
  MODEFENCE: "MODEFENCE.NS",
  NIFTYCASE: "NIFTYCASE.NS",
};

function alnumKey(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Resolve an ETF override symbol from ISIN or a normalized ticker/name. */
function etfOverrideSymbol(ticker: string, isin?: string): string | undefined {
  const byIsin = isin ? ETF_BY_ISIN[isin.toUpperCase()] : undefined;
  return byIsin ?? ETF_BY_KEY[alnumKey(ticker)];
}

/** Candidate Yahoo symbols for a ticker, given the display currency. */
function symbolCandidates(ticker: string, currency?: string, isin?: string): string[] {
  const override = etfOverrideSymbol(ticker, isin);
  if (override) return [override];

  const t = ticker.toUpperCase();
  if (currency === "INR") {
    const base = t.split(/[-\s/]/)[0]!; // strip suffixes like "-RR", "-IV"
    return Array.from(new Set([`${t}.NS`, `${base}.NS`, `${t}.BO`, `${base}.BO`]));
  }
  return [t];
}

/**
 * Resolve a live price. Exchange-traded instruments (stocks + ETFs, incl. gold/
 * silver/index ETFs) are priced at market via Yahoo; open-ended mutual funds
 * (equity, debt, fund-of-funds) are priced at NAV via AMFI. The routing uses the
 * shared asset-class classifier so pricing and allocation always agree — an ETF
 * can trade at a real premium/discount to NAV, so it must never use the NAV path.
 * Independent upstreams/breakers mean a slow/blocked MF lookup never disables
 * equity quotes (or vice versa); the Yahoo breaker trips only after several fails.
 */
async function fetchLivePrice(
  ticker: string,
  currency: string | undefined,
  isin: string | undefined,
): Promise<number | null> {
  // Open-ended mutual funds (but NOT ETFs) → AMFI NAV.
  if (classifyAssetClass(ticker, isin) === "Mutual Fund") {
    const { fetchMfNav } = await import("./amfi");
    return fetchMfNav(isin, ticker);
  }

  // Equities / ETFs → Yahoo market price.
  let yahoo: number | null = null;
  if (Date.now() >= yahooDisabledUntil) {
    const { fetchYahooPrice } = await import("./yahoo");
    for (const symbol of symbolCandidates(ticker, currency, isin)) {
      try {
        const price = await fetchYahooPrice(symbol);
        if (price) {
          yahooConsecutiveFails = 0;
          yahoo = price;
          break;
        }
      } catch {
        yahooConsecutiveFails++;
        if (yahooConsecutiveFails >= 3) yahooDisabledUntil = Date.now() + BREAKER_MS;
        break;
      }
    }
  }
  if (yahoo != null) return yahoo;

  // Fallback for ETFs that Yahoo doesn't list yet (e.g. newly-launched ones like
  // NIFTYCASE): AMFI publishes NAVs for ETFs too, matched by their INF-prefixed
  // ISIN. For a liquid index ETF the NAV ≈ market price, so it's a sound stand-in
  // when no exchange quote is available.
  if (isin && /^INF/i.test(isin)) {
    const { fetchMfNav } = await import("./amfi");
    const nav = await fetchMfNav(isin, ticker);
    if (nav != null) return nav;
  }

  return null;
}

async function resolveOne(
  ticker: string,
  hint: PriceHint | undefined,
  currency?: string,
): Promise<InstrumentData> {
  const symbol = ticker.toUpperCase();

  // Determine the anchor (current) price by priority.
  let anchor = hint?.current;
  let source = anchor != null ? "user" : "";
  if (anchor == null && isLivePricingEnabled()) {
    const live = await fetchLivePrice(symbol, currency, hint?.isin);
    if (live != null) {
      anchor = live;
      source = "live";
    }
  }
  if (anchor == null) {
    anchor = hint?.cost;
    source = "cost";
  }

  const cacheKey = `${symbol}|${anchor ?? ""}|${source}|${currency ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  const data = syntheticInstrument(symbol, anchor, currency);
  cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });
  return data;
}

/**
 * Resolve a batch of tickers with bounded concurrency.
 * `priceHints` carries each position's user-supplied current price and cost.
 */
export async function resolveInstruments(
  tickers: string[],
  priceHints?: Record<string, PriceHint>,
  currency?: string,
): Promise<Record<string, InstrumentData>> {
  const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
  const out: Record<string, InstrumentData> = {};

  for (let i = 0; i < unique.length; i += MAX_CONCURRENCY) {
    const batch = unique.slice(i, i + MAX_CONCURRENCY);
    const results = await Promise.all(
      batch.map((t) => resolveOne(t, priceHints?.[t], currency)),
    );
    batch.forEach((t, idx) => {
      out[t] = results[idx]!;
    });
  }
  return out;
}

export async function resolveBenchmark(): Promise<{ date: string; close: number }[]> {
  // The benchmark stays synthetic so its dates align with the synthetic
  // instrument histories used by the analytics engine.
  return syntheticBenchmark();
}
