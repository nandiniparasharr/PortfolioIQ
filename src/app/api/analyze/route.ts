import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation";
import { resolveBenchmark, resolveInstruments } from "@/lib/market/provider";
import { computeAnalytics } from "@/lib/analytics/engine";
import { generateCommentary } from "@/lib/ai/commentary";
import type { Holding } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 * Body: { holdings: Holding[] }
 * Returns: { analytics, commentary }
 *
 * The deterministic analytics are computed first; commentary only interprets
 * them. Market data is resolved server-side (cached, rate-limited, with a
 * synthetic fallback), so the client never touches an upstream provider.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const holdings: Holding[] = parsed.data.holdings;

  try {
    const tickers = holdings.map((h) => h.ticker);
    // Anchor modeled prices to each position's cost basis (keeps value &
    // unrealized P&L realistic when live data isn't available).
    const priceHints: Record<string, number> = {};
    for (const h of holdings) {
      if (h.purchasePrice && h.purchasePrice > 0) {
        priceHints[h.ticker.toUpperCase()] = h.purchasePrice;
      }
    }
    const [instruments, benchmarkHistory] = await Promise.all([
      resolveInstruments(tickers, priceHints),
      resolveBenchmark(),
    ]);

    const analytics = computeAnalytics({
      holdings,
      instruments,
      benchmarkHistory,
      currency: parsed.data.currency,
    });
    const commentary = await generateCommentary(analytics);

    return NextResponse.json({ analytics, commentary });
  } catch (error) {
    console.error("[/api/analyze] failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze portfolio." },
      { status: 500 },
    );
  }
}
