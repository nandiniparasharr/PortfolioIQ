import { describe, it, expect } from "vitest";
import { computeAnalytics, type EngineInput } from "./engine";
import { syntheticBenchmark, syntheticInstrument } from "@/lib/market/synthetic";
import type { Holding } from "@/types";

function buildInput(holdings: Holding[]): EngineInput {
  const instruments = Object.fromEntries(
    holdings.map((h) => [h.ticker, syntheticInstrument(h.ticker)]),
  );
  return { holdings, instruments, benchmarkHistory: syntheticBenchmark() };
}

describe("analytics engine", () => {
  const holdings: Holding[] = [
    { id: "1", ticker: "AAPL", quantity: 50, purchasePrice: 150 },
    { id: "2", ticker: "MSFT", quantity: 30, purchasePrice: 280 },
    { id: "3", ticker: "JPM", quantity: 40, purchasePrice: 140 },
    { id: "4", ticker: "XOM", quantity: 60, purchasePrice: 95 },
  ];

  it("produces weights that sum to 1", () => {
    const a = computeAnalytics(buildInput(holdings));
    const totalWeight = a.positions.reduce((s, p) => s + p.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 8);
  });

  it("market value equals sum of position values", () => {
    const a = computeAnalytics(buildInput(holdings));
    const sum = a.positions.reduce((s, p) => s + p.marketValue, 0);
    expect(a.totalValue).toBeCloseTo(sum, 6);
  });

  it("allocation weights for each dimension sum to ~1", () => {
    const a = computeAnalytics(buildInput(holdings));
    for (const dim of [
      a.allocation.bySector,
      a.allocation.byRegion,
      a.allocation.byMarketCap,
    ]) {
      const total = dim.reduce((s, slice) => s + slice.weight, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it("risk contributions sum to ~1", () => {
    const a = computeAnalytics(buildInput(holdings));
    const total = a.risk.contribution.reduce((s, r) => s + r.riskContribution, 0);
    expect(total).toBeCloseTo(1, 4);
  });

  it("HHI equals 1/n for an equal-weighted book", () => {
    const equal: Holding[] = ["AAPL", "MSFT", "JPM", "XOM"].map((t, i) => ({
      id: String(i),
      ticker: t,
      quantity: 0, // overwritten below to equalize value
    }));
    // Equalize market value by setting quantity = 10000 / price.
    const input = buildInput(equal);
    for (const h of equal) {
      h.quantity = 10000 / input.instruments[h.ticker]!.lastPrice;
    }
    const a = computeAnalytics(input);
    expect(a.diversification.hhi).toBeCloseTo(0.25, 2);
    expect(a.diversification.effectiveHoldings).toBeCloseTo(4, 1);
  });

  it("scores are bounded in [0, 100]", () => {
    const a = computeAnalytics(buildInput(holdings));
    for (const s of [a.scores.health, a.scores.risk, a.scores.diversification]) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
    expect(["A", "B", "C", "D", "F"]).toContain(a.scores.grade);
  });

  it("is deterministic for identical inputs", () => {
    const a1 = computeAnalytics(buildInput(holdings));
    const a2 = computeAnalytics(buildInput(holdings));
    expect(a1.performance.annualizedVolatility).toBe(
      a2.performance.annualizedVolatility,
    );
    expect(a1.scores.health).toBe(a2.scores.health);
  });

  it("anchors modeled price to cost basis for realistic unrealized returns", () => {
    // Arbitrary Indian-style tickers with INR cost bases.
    const book: Holding[] = [
      { id: "1", ticker: "NIFTYCASE", quantity: 1750, purchasePrice: 100 },
      { id: "2", ticker: "EMBASSY-RR", quantity: 22, purchasePrice: 350 },
      { id: "3", ticker: "MGL", quantity: 18, purchasePrice: 1100 },
    ];
    const instruments = Object.fromEntries(
      book.map((h) => [h.ticker, syntheticInstrument(h.ticker, h.purchasePrice, "INR")]),
    );
    const a = computeAnalytics({
      holdings: book,
      instruments,
      benchmarkHistory: syntheticBenchmark(),
      currency: "INR",
    });
    expect(a.baseCurrency).toBe("INR");
    // INR holdings are geolocated to India / Asia Pacific, not a random region.
    expect(a.allocation.byRegion.every((r) => r.label === "Asia Pacific")).toBe(true);
    for (const p of a.positions) {
      expect(p.data.meta.country).toBe("India");
      // Without a current price, price shows at cost (no fabricated return).
      const cost = p.holding.purchasePrice!;
      expect(p.data.lastPrice).toBeCloseTo(cost, 1);
      expect(Math.abs(p.unrealizedReturn ?? 0)).toBeLessThan(0.01);
    }
  });

  it("uses the supplied current price for accurate unrealized P&L", () => {
    const book: Holding[] = [
      { id: "1", ticker: "ITC", quantity: 25, purchasePrice: 326, currentPrice: 400 },
    ];
    const instruments = {
      ITC: syntheticInstrument("ITC", 400, "INR"),
    };
    const a = computeAnalytics({
      holdings: book,
      instruments,
      benchmarkHistory: syntheticBenchmark(),
      currency: "INR",
    });
    const p = a.positions[0]!;
    expect(p.data.lastPrice).toBeCloseTo(400, 1);
    // Return = (400 - 326) / 326 ≈ +22.7%
    expect(p.unrealizedReturn).toBeCloseTo((400 - 326) / 326, 2);
  });

  it("correlation matrix is symmetric with unit diagonal", () => {
    const a = computeAnalytics(buildInput(holdings));
    const { tickers, matrix } = a.risk.correlation;
    for (let i = 0; i < tickers.length; i++) {
      expect(matrix[i]![i]).toBeCloseTo(1, 10);
      for (let j = 0; j < tickers.length; j++) {
        expect(matrix[i]![j]).toBeCloseTo(matrix[j]![i]!, 10);
      }
    }
  });
});
