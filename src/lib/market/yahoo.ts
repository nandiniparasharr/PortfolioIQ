import "server-only";

/**
 * Lightweight live-quote fetch.
 *
 * We deliberately fetch ONLY the latest price (not full history) via Yahoo's
 * public chart endpoint, which needs no cookie/crumb auth. The price is used to
 * anchor the modeled instrument so market value and unrealized P&L are real,
 * while the synthetic price history continues to drive the (date-aligned)
 * time-series analytics. Any failure returns null / throws so the caller can
 * fall back to the user's cost basis.
 */

const TIMEOUT_MS = 4500;

interface ChartMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  currency?: string;
}

/**
 * Fetch the latest price for an exact symbol (e.g. "ITC.NS").
 * Returns the price, or null when the symbol is unknown / has no price.
 * Throws on a network/timeout failure so the caller can trip a circuit breaker.
 */
export async function fetchYahooPrice(symbol: string): Promise<number | null> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=5d`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null; // unknown symbol (404 etc.) — not a network failure

  const json = (await res.json()) as {
    chart?: { result?: { meta?: ChartMeta }[] };
  };
  const meta = json?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice ?? meta?.chartPreviousClose;
  return typeof price === "number" && price > 0 ? price : null;
}
