import "server-only";
import type { InstrumentData } from "@/types";
import { syntheticBenchmark, syntheticInstrument } from "./synthetic";

/**
 * Server-side market-data orchestrator.
 *
 * Responsibilities:
 *   - select the configured provider (synthetic by default, Yahoo if enabled);
 *   - cache resolved instruments in-process with a TTL;
 *   - apply a light concurrency limit so a large portfolio cannot fan out into
 *     a burst of upstream requests;
 *   - fall back to the synthetic provider on any upstream failure so a single
 *     bad ticker never fails the whole request.
 */

const TTL_MS = 1000 * 60 * 30; // 30 minutes
const MAX_CONCURRENCY = 4;

interface CacheEntry {
  data: InstrumentData;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

function isYahooEnabled(): boolean {
  return (process.env.MARKET_DATA_PROVIDER ?? "synthetic").toLowerCase() === "yahoo";
}

async function resolveOne(ticker: string, anchorPrice?: number): Promise<InstrumentData> {
  const symbol = ticker.toUpperCase();
  // The anchor (cost basis) affects the modeled price, so it is part of the key.
  const cacheKey = `${symbol}|${anchorPrice ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  let data: InstrumentData;
  if (isYahooEnabled()) {
    try {
      const { fetchYahooInstrument } = await import("./yahoo");
      data = await fetchYahooInstrument(symbol);
      if (data.history.length < 30) data = syntheticInstrument(symbol, anchorPrice);
    } catch {
      data = syntheticInstrument(symbol, anchorPrice);
    }
  } else {
    data = syntheticInstrument(symbol, anchorPrice);
  }

  cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });
  return data;
}

/**
 * Resolve a batch of tickers with bounded concurrency.
 * `priceHints` maps a ticker to the user's cost basis so the synthetic provider
 * can anchor modeled prices to it (keeping unrealized P&L realistic).
 */
export async function resolveInstruments(
  tickers: string[],
  priceHints?: Record<string, number>,
): Promise<Record<string, InstrumentData>> {
  const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
  const out: Record<string, InstrumentData> = {};

  for (let i = 0; i < unique.length; i += MAX_CONCURRENCY) {
    const batch = unique.slice(i, i + MAX_CONCURRENCY);
    const results = await Promise.all(
      batch.map((t) => resolveOne(t, priceHints?.[t])),
    );
    batch.forEach((t, idx) => {
      out[t] = results[idx]!;
    });
  }
  return out;
}

export async function resolveBenchmark(): Promise<{ date: string; close: number }[]> {
  if (isYahooEnabled()) {
    try {
      const { fetchYahooBenchmark } = await import("./yahoo");
      const data = await fetchYahooBenchmark();
      if (data.length >= 30) return data;
    } catch {
      // fall through to synthetic
    }
  }
  return syntheticBenchmark();
}
