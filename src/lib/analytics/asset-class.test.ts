import { describe, it, expect } from "vitest";
import { classifyAssetClass } from "./asset-class";

describe("classifyAssetClass", () => {
  it("classifies direct equities", () => {
    expect(classifyAssetClass("RELIANCE", "INE002A01018")).toBe("Equity");
    expect(classifyAssetClass("HDFCBANK")).toBe("Equity");
  });

  it("classifies mutual funds by scheme name / INF ISIN", () => {
    expect(classifyAssetClass("Parag Parikh Flexi Cap Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("SBICONTRA", "INF200K01VT2")).toBe("Mutual Fund");
  });

  it("classifies ETFs", () => {
    expect(classifyAssetClass("NIFTYBEES")).toBe("ETF");
    expect(classifyAssetClass("HNGSNGBEES")).toBe("ETF");
    expect(classifyAssetClass("Motilal Oswal Nasdaq 100 ETF")).toBe("ETF");
  });

  it("classifies debt schemes", () => {
    expect(classifyAssetClass("ICICI Prudential Corporate Bond Fund")).toBe("Debt");
    expect(classifyAssetClass("SBI Liquid Fund")).toBe("Debt");
    expect(classifyAssetClass("HDFC Gilt Fund")).toBe("Debt");
  });

  it("classifies gold / commodity ahead of the ETF wrapper", () => {
    expect(classifyAssetClass("GOLDBEES")).toBe("Gold / Commodity");
    expect(classifyAssetClass("Nippon India Silver ETF")).toBe("Gold / Commodity");
    expect(classifyAssetClass("Motilal Oswal Gold and Silver Passive FoF")).toBe(
      "Gold / Commodity",
    );
  });
});
