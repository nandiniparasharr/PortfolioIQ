import { describe, it, expect } from "vitest";
import { parseHoldingsFile } from "./parse-holdings";

function csvFile(content: string, name = "holdings.csv"): File {
  return new File([content], name, { type: "text/csv" });
}

describe("parseHoldingsFile (CSV)", () => {
  it("detects a header that is not on the first row", async () => {
    const csv = [
      "My Brokerage Export",
      "Generated 2024-01-01",
      "",
      "Symbol,Shares,Cost per share,Trade Date",
      "AAPL,60,150.00,2023-06-15",
      "MSFT,30,280.00,08/01/2023",
    ].join("\n");

    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.error).toBeUndefined();
    expect(out.headerRow).toBe(3);
    expect(out.holdings).toHaveLength(2);
    expect(out.holdings[0]).toEqual({
      ticker: "AAPL",
      quantity: 60,
      purchasePrice: 150,
      purchaseDate: "2023-06-15",
    });
    // US-style date is normalized to ISO.
    expect(out.holdings[1]!.purchaseDate).toBe("2023-08-01");
  });

  it("matches fuzzy, differently-ordered headers and currency symbols", async () => {
    const csv = [
      "Avg Cost,Ticker Symbol,Qty",
      "$98.50,BRK.B,3",
      '"$1,234.50",GOOGL,1',
    ].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(2);
    expect(out.holdings[0]).toMatchObject({
      ticker: "BRK.B",
      quantity: 3,
      purchasePrice: 98.5,
    });
    // Quoted thousands separator is handled.
    expect(out.holdings[1]!.purchasePrice).toBe(1234.5);
  });

  it("maps a current-price / LTP column when present", async () => {
    const csv = ["Symbol,Qty,Avg Price,LTP", "ITC,25,326,400.5"].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings[0]).toMatchObject({
      ticker: "ITC",
      quantity: 25,
      purchasePrice: 326,
      currentPrice: 400.5,
    });
  });

  it("imports mutual-fund rows identified by scheme name", async () => {
    const csv = [
      "Scheme Name,Units,Cost,Current NAV",
      "Axis Bluechip Fund Direct Growth,120.5,45.2,52.8",
    ].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(1);
    expect(out.holdings[0]).toMatchObject({
      ticker: "AXIS BLUECHIP FUND DIRECT GROWTH",
      quantity: 120.5,
      purchasePrice: 45.2,
      currentPrice: 52.8,
    });
  });

  it("captures ISIN alongside the scheme name for mutual funds", async () => {
    const csv = [
      "Scheme Name,ISIN,Units,Cost",
      "Axis Bluechip Fund Direct Growth,INF846K01EW2,120,45",
    ].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings[0]).toMatchObject({
      ticker: "AXIS BLUECHIP FUND DIRECT GROWTH",
      isin: "INF846K01EW2",
      quantity: 120,
      purchasePrice: 45,
    });
  });

  it("skips rows that are missing the required cost per share", async () => {
    const csv = [
      "ticker,quantity,price",
      "AAPL,10,150",
      "MSFT,5,", // no price -> skipped
      "GOOGL,2,170",
    ].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(2);
    expect(out.skipped).toBe(1);
    expect(out.holdings.map((h) => h.ticker)).toEqual(["AAPL", "GOOGL"]);
  });

  it("errors clearly when no price column exists", async () => {
    const csv = ["ticker,quantity", "AAPL,10"].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(0);
    expect(out.error).toMatch(/couldn't find a holdings table/i);
  });

  it("imports stacked tables (e.g. equity then mutual funds) in one sheet", async () => {
    const csv = [
      "Symbol,Qty,Avg Price",
      "ITC,25,326",
      "",
      "Scheme Name,Units,Cost,Current NAV",
      "Motilal Oswal Gold and Silver Passive Fund of Funds Direct Growth,1200,12.5,15.2",
    ].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(2);
    expect(out.holdings.map((h) => h.ticker)).toContain("ITC");
    const mf = out.holdings.find((h) => h.ticker.startsWith("MOTILAL"));
    expect(mf).toBeTruthy();
    expect(mf!.currentPrice).toBe(15.2);
  });

  it("errors when no holdings table can be found", async () => {
    const csv = ["just some notes", "no table here"].join("\n");
    const out = await parseHoldingsFile(csvFile(csv));
    expect(out.holdings).toHaveLength(0);
    expect(out.error).toMatch(/couldn't find a holdings table/i);
  });
});
