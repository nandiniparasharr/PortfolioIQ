import { describe, it, expect } from "vitest";
import { classifyAssetClass } from "./asset-class";

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

  it("classifies open-ended schemes as Mutual Fund", () => {
    expect(classifyAssetClass("Parag Parikh Flexi Cap Fund")).toBe("Mutual Fund");
    expect(classifyAssetClass("SBICONTRA", "INF200K01VT2")).toBe("Mutual Fund");
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
