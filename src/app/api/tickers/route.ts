import { NextResponse } from "next/server";
import { catalogTickers } from "@/lib/market/instruments";

export const runtime = "nodejs";

/**
 * GET /api/tickers?q=app
 * Lightweight autocomplete over the curated instrument catalog.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toUpperCase();

  const all = catalogTickers().map((s) => ({
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
  }));

  if (!q) {
    return NextResponse.json({ results: all.slice(0, 8) });
  }

  const results = all
    .filter(
      (s) =>
        s.ticker.includes(q) || s.name.toUpperCase().includes(q),
    )
    .sort((a, b) => {
      // Exact / prefix matches on ticker rank first.
      const aStarts = a.ticker.startsWith(q) ? 0 : 1;
      const bStarts = b.ticker.startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    })
    .slice(0, 8);

  return NextResponse.json({ results });
}
