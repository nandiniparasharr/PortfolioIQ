import { describe, it, expect } from "vitest";
import {
  mean,
  variance,
  stdDev,
  correlation,
  toReturns,
  annualizedReturn,
  annualizedVolatility,
  cumulativeReturn,
  sharpeRatio,
  maxDrawdown,
  beta,
  historicalVaR,
  conditionalVaR,
  herfindahl,
  TRADING_DAYS_PER_YEAR,
} from "./statistics";

describe("descriptive statistics", () => {
  it("computes the mean", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(mean([])).toBe(0);
  });

  it("computes Bessel-corrected variance and std dev", () => {
    // Sample variance of [2,4,4,4,5,5,7,9] is 4 -> sd 2.
    const xs = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(variance(xs)).toBeCloseTo(4.571, 2);
    expect(stdDev(xs)).toBeCloseTo(Math.sqrt(variance(xs)), 10);
  });

  it("returns perfect correlation for a linear series", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(correlation(x, y)).toBeCloseTo(1, 10);
  });

  it("returns -1 for a perfectly inverse series", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    expect(correlation(x, y)).toBeCloseTo(-1, 10);
  });
});

describe("return transforms", () => {
  it("converts prices to simple returns", () => {
    const r = toReturns([100, 110, 99]);
    expect(r[0]).toBeCloseTo(0.1, 10);
    expect(r[1]).toBeCloseTo(-0.1, 10);
  });

  it("compounds cumulative return correctly", () => {
    // +10% then -10% -> -1%.
    expect(cumulativeReturn([0.1, -0.1])).toBeCloseTo(-0.01, 10);
  });

  it("annualizes a constant daily return", () => {
    const daily = new Array(TRADING_DAYS_PER_YEAR).fill(0.0004);
    const expected = (1 + 0.0004) ** TRADING_DAYS_PER_YEAR - 1;
    expect(annualizedReturn(daily)).toBeCloseTo(expected, 8);
  });

  it("annualizes volatility by sqrt(252)", () => {
    const daily = [0.01, -0.01, 0.02, -0.02, 0.005];
    expect(annualizedVolatility(daily)).toBeCloseTo(
      stdDev(daily) * Math.sqrt(TRADING_DAYS_PER_YEAR),
      10,
    );
  });
});

describe("risk metrics", () => {
  it("computes maximum drawdown", () => {
    // +20%, then a sequence dropping equity from 1.2 to 0.6 -> 50% drawdown.
    const dd = maxDrawdown([0.2, -0.5]);
    expect(dd).toBeCloseTo(0.5, 10);
  });

  it("computes beta of 1 against itself", () => {
    const r = [0.01, -0.02, 0.03, -0.01, 0.005];
    expect(beta(r, r)).toBeCloseTo(1, 10);
  });

  it("computes historical VaR as a positive loss quantile", () => {
    const returns = [-0.05, -0.03, -0.01, 0.0, 0.01, 0.02, 0.03, 0.04, 0.05, -0.1];
    const var95 = historicalVaR(returns, 0.95);
    expect(var95).toBeGreaterThan(0);
    // 95% VaR should be at/above the worst couple of losses.
    expect(var95).toBeLessThanOrEqual(0.1);
  });

  it("CVaR is at least as large as VaR", () => {
    const returns = [-0.05, -0.03, -0.01, 0.0, 0.02, 0.03, 0.05, -0.12, 0.01, -0.08];
    expect(conditionalVaR(returns, 0.95)).toBeGreaterThanOrEqual(
      historicalVaR(returns, 0.95),
    );
  });

  it("Sharpe ratio is zero for a zero-variance series", () => {
    expect(sharpeRatio([0.001, 0.001, 0.001], 0.0)).toBe(0);
  });
});

describe("concentration", () => {
  it("HHI of an equal-weighted n-portfolio equals 1/n", () => {
    const w = [0.25, 0.25, 0.25, 0.25];
    expect(herfindahl(w)).toBeCloseTo(0.25, 10);
  });

  it("HHI of a single holding equals 1", () => {
    expect(herfindahl([1])).toBe(1);
  });
});
