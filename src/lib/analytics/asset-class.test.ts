import { describe, it, expect } from "vitest";
import {
  classifyAssetClass,
  classifyEquityCategory,
  classifyFundCategory,
} from "./asset-class";

describe("classifyAssetClass (Equity vs Mutual Fund)", () => {
  it("classifies direct equities", () => {
    expect(classifyAssetClass("RELIANCE", "INE002A01018")).toBe("Equity");
    expect(classifyAssetClass("HDFCBANK")).toBe("Equity");
  });

  it("classifies ETFs as Equity (exchange-traded)", () => {
    expect(classifyAssetClass("NIFTYBEES")).toBe("Equity");
    expect(classifyAssetClass("HNGSNGBEES", "INF204KB19I1")).toBe("Equity");
    expect(classifyAssetClass("GOLDBEES")).toBe("Equity");
    expect(classifyAssetClass("Nippon India Silver ETF")).toBe("Equity");
    expect(classifyAssetClass("Nippon India ETF Hang Seng BeES")).toBe("Equity");
  });

  it("treats short exchange tickers with INF ISINs as Equity (ETFs)", () => {
    // Many ETFs share the INF ISIN prefix; the ISIN must not force Mutual Fund.
    expect(classifyAssetClass("NIFTYCASE", "INF204KB1XX0")).toBe("Equity");
    expect(classifyAssetClass("MODEFENCE", "INF247L01XX0")).toBe("Equity");
  });

  it("classifies open-ended schemes (by name) as Mutual Fund", () => {
    expect(classifyAssetClass("Parag Parikh Flexi Cap Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("SBI Contra Fund")).toBe("Mutual Fund");
  });

  it("classifies debt/liquid funds as Mutual Fund", () => {
    expect(classifyAssetClass("ICICI Prudential Corporate Bond Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("SBI Liquid Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("HDFC Gilt Fund")).toBe("Mutual Fund");
  });

  it("classifies ETF fund-of-funds as Mutual Fund, not Equity", () => {
    expect(classifyAssetClass("Motilal Oswal Nasdaq 100 ETF Fund of Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("Motilal Oswal Nasdaq 100 FOF")).toBe("Mutual Fund");
    expect(classifyAssetClass("Motilal Oswal Gold and Silver Passive FoF")).toBe("Mutual Fund");
  });
});

describe("classifyEquityCategory", () => {
  it("splits stocks, ETFs and commodity ETFs", () => {
    expect(classifyEquityCategory("RELIANCE")).toBe("Stocks");
    expect(classifyEquityCategory("NIFTYBEES")).toBe("ETFs");
    expect(classifyEquityCategory("HNGSNGBEES")).toBe("ETFs");
    expect(classifyEquityCategory("GOLDBEES")).toBe("Commodity");
    expect(classifyEquityCategory("Nippon India Silver ETF")).toBe("Commodity");
  });
});

describe("classifyFundCategory", () => {
  it("splits equity / debt / hybrid / commodity funds", () => {
    expect(classifyFundCategory("Parag Parikh Flexi Cap Fund")).toBe("Equity Fund");
    expect(classifyFundCategory("Mirae Asset Large Cap Fund")).toBe("Equity Fund");
    expect(classifyFundCategory("ICICI Prudential Corporate Bond Fund")).toBe("Debt Fund");
    expect(classifyFundCategory("SBI Liquid Fund")).toBe("Debt Fund");
    expect(classifyFundCategory("HDFC Balanced Advantage Fund")).toBe("Hybrid Fund");
    expect(classifyFundCategory("ICICI Prudential Multi Asset Fund")).toBe("Hybrid Fund");
    expect(classifyFundCategory("Motilal Oswal Gold and Silver Passive FoF")).toBe(
      "Commodity Fund",
    );
  });
});
