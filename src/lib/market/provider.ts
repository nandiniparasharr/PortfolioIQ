import "server-only";
import type { InstrumentData } from "@/types";
import { syntheticBenchmark, syntheticInstrument } from "./synthetic";

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

/** Candidate Yahoo symbols for a ticker, given the display currency. */
function symbolCandidates(ticker: string, currency?: string): string[] {
  const t = ticker.toUpperCase();
  if (currency === "INR") {
    const base = t.split(/[-\s/]/)[0]!; // strip suffixes like "-RR", "-IV"
    return Array.from(new Set([`${t}.NS`, `${base}.NS`, `${t}.BO`, `${base}.BO`]));
  }
  return [t];
}

/** A mutual fund is identified by a scheme name (spaces) or an INF-prefix ISIN. */
function isMutualFund(ticker: string, isin?: string): boolean {
  return /\s/.test(ticker) || (!!isin && /^INF/i.test(isin)) || ticker.length > 16;
}

/**
 * Resolve a live price. Mutual funds and equities use independent upstreams and
 * breakers, so a slow/blocked MF lookup never disables equity quotes (or vice
 * versa). The Yahoo breaker only trips after several consecutive failures, so a
 * single transient blip doesn't push the rest of the portfolio "to cost".
 */
async function fetchLivePrice(
  ticker: string,
  currency: string | undefined,
  isin: string | undefined,
): Promise<number | null> {
  // Mutual funds → AMFI NAV (AMFI manages its own breaker).
  if (isMutualFund(ticker, isin)) {
    const { fetchMfNav } = await import("./amfi");
    return fetchMfNav(isin, ticker);
  }

  // Equities / ETFs → Yahoo quote.
  if (Date.now() < yahooDisabledUntil) return null;
  const { fetchYahooPrice } = await import("./yahoo");
  for (const symbol of symbolCandidates(ticker, currency)) {
    try {
      const price = await fetchYahooPrice(symbol);
      if (price) {
        yahooConsecutiveFails = 0;
        return price;
      }
    } catch {
      yahooConsecutiveFails++;
      if (yahooConsecutiveFails >= 3) yahooDisabledUntil = Date.now() + BREAKER_MS;
      return null;
    }
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
