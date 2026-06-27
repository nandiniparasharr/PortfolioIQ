import "server-only";
import type { InstrumentData, InstrumentMeta, PricePoint } from "@/types";
import { bucketForMarketCap } from "./instruments";
import type { Region, Sector } from "@/types";

/**
 * Live market-data provider backed by Yahoo Finance.
 *
 * Loaded lazily and only on the server. Any failure is surfaced to the caller,
 * which is responsible for falling back to the synthetic provider so the app
 * never hard-fails on a flaky upstream.
 */

const SECTOR_MAP: Record<string, Sector> = {
  "Technology": "Information Technology",
  "Financial Services": "Financials",
  "Financial": "Financials",
  "Healthcare": "Health Care",
  "Consumer Cyclical": "Consumer Discretionary",
  "Consumer Defensive": "Consumer Staples",
  "Communication Services": "Communication Services",
  "Industrials": "Industrials",
  "Energy": "Energy",
  "Utilities": "Utilities",
  "Real Estate": "Real Estate",
  "Basic Materials": "Materials",
};

const REGION_BY_COUNTRY: Record<string, Region> = {
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "Latin America",
  "Brazil": "Latin America",
  "United Kingdom": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Netherlands": "Europe",
  "Switzerland": "Europe",
  "China": "Asia Pacific",
  "Japan": "Asia Pacific",
  "Taiwan": "Asia Pacific",
  "India": "Asia Pacific",
  "Australia": "Asia Pacific",
};

function mapSector(raw?: string): Sector {
  if (!raw) return "Unknown";
  return SECTOR_MAP[raw] ?? "Unknown";
}

function mapRegion(country?: string): Region {
  if (!country) return "Unknown";
  return REGION_BY_COUNTRY[country] ?? "Unknown";
}

/** Minimal surface of yahoo-finance2 used here, to avoid its broad union types. */
interface YahooQuote {
  date: string | number | Date;
  close?: number | null;
}
interface YahooProfile {
  country?: string;
  sector?: string;
  industry?: string;
}
interface YahooPrice {
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  marketCap?: number;
  currency?: string;
}
interface YahooClient {
  quoteSummary: (
    symbol: string,
    opts: { modules: string[] },
  ) => Promise<{ price?: YahooPrice; summaryProfile?: YahooProfile; assetProfile?: YahooProfile }>;
  chart: (
    symbol: string,
    opts: { period1: Date; interval: string },
  ) => Promise<{ quotes?: YahooQuote[] }>;
}

async function loadYahoo(): Promise<YahooClient> {
  const mod = await import("yahoo-finance2");
  return (mod.default ?? mod) as unknown as YahooClient;
}

export async function fetchYahooInstrument(ticker: string): Promise<InstrumentData> {
  const yahooFinance = await loadYahoo();
  const symbol = ticker.toUpperCase();

  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - 3);

  const [quote, chart] = await Promise.all([
    yahooFinance.quoteSummary(symbol, {
      modules: ["price", "summaryProfile", "assetProfile"],
    }),
    yahooFinance.chart(symbol, { period1, interval: "1d" }),
  ]);

  const profile = quote.summaryProfile ?? quote.assetProfile;
  const price = quote.price;
  const country = profile?.country;

  const history: PricePoint[] = (chart.quotes ?? [])
    .filter((q) => q.close != null && q.date != null)
    .map((q) => ({
      date: new Date(q.date).toISOString().slice(0, 10),
      close: Number(q.close),
    }));

  const lastPrice: number =
    history.at(-1)?.close ?? Number(price?.regularMarketPrice ?? 0);
  const marketCap = Number(price?.marketCap ?? 0);

  const meta: InstrumentMeta = {
    ticker: symbol,
    name: price?.longName ?? price?.shortName ?? symbol,
    sector: mapSector(profile?.sector),
    industry: profile?.industry ?? "Unknown",
    region: mapRegion(country),
    country: country ?? "Unknown",
    marketCap,
    marketCapBucket: bucketForMarketCap(marketCap),
    currency: price?.currency ?? "USD",
  };

  return { meta, lastPrice, history };
}

export async function fetchYahooBenchmark(): Promise<
  { date: string; close: number }[]
> {
  const yahooFinance = await loadYahoo();
  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - 3);
  const chart = await yahooFinance.chart("^GSPC", { period1, interval: "1d" });
  return (chart.quotes ?? [])
    .filter((q) => q.close != null && q.date != null)
    .map((q) => ({
      date: new Date(q.date).toISOString().slice(0, 10),
      close: Number(q.close),
    }));
}
