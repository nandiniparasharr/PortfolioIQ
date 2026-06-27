import type { InstrumentMeta, MarketCapBucket, Region, Sector } from "@/types";

/**
 * Curated reference data for commonly-held instruments.
 *
 * This catalog gives the synthetic provider realistic sector / region /
 * market-cap classifications and seeds plausible return characteristics
 * (annual drift and volatility, plus a market beta used to induce a realistic
 * correlation structure). For tickers outside the catalog, the synthetic
 * provider derives stable pseudo-fundamentals from the symbol itself.
 */
export interface InstrumentSeed extends InstrumentMeta {
  /** Expected annual drift used by the synthetic price model. */
  annualDrift: number;
  /** Annual idiosyncratic volatility. */
  annualVol: number;
  /** Sensitivity to the common market factor. */
  beta: number;
  /** Reference last price. */
  referencePrice: number;
}

export function bucketForMarketCap(cap: number): MarketCapBucket {
  if (cap >= 2e11) return "Mega Cap";
  if (cap >= 1e10) return "Large Cap";
  if (cap >= 2e9) return "Mid Cap";
  if (cap >= 3e8) return "Small Cap";
  if (cap > 0) return "Micro Cap";
  return "Unknown";
}

type Seed = Omit<InstrumentSeed, "marketCapBucket">;

const RAW: Seed[] = [
  s("AAPL", "Apple Inc.", "Information Technology", "Technology Hardware", "North America", "United States", 3.0e12, 195, 0.18, 0.26, 1.21),
  s("MSFT", "Microsoft Corp.", "Information Technology", "Software", "North America", "United States", 3.1e12, 430, 0.2, 0.24, 1.08),
  s("NVDA", "NVIDIA Corp.", "Information Technology", "Semiconductors", "North America", "United States", 2.9e12, 118, 0.35, 0.45, 1.65),
  s("GOOGL", "Alphabet Inc.", "Communication Services", "Interactive Media", "North America", "United States", 2.1e12, 175, 0.17, 0.27, 1.05),
  s("AMZN", "Amazon.com Inc.", "Consumer Discretionary", "Internet Retail", "North America", "United States", 1.9e12, 185, 0.19, 0.31, 1.18),
  s("META", "Meta Platforms Inc.", "Communication Services", "Interactive Media", "North America", "United States", 1.3e12, 510, 0.22, 0.36, 1.27),
  s("TSLA", "Tesla Inc.", "Consumer Discretionary", "Automobiles", "North America", "United States", 8.0e11, 250, 0.18, 0.55, 1.7),
  s("BRK.B", "Berkshire Hathaway", "Financials", "Diversified Financials", "North America", "United States", 9.0e11, 415, 0.11, 0.16, 0.85),
  s("JPM", "JPMorgan Chase & Co.", "Financials", "Banks", "North America", "United States", 6.0e11, 205, 0.12, 0.23, 1.12),
  s("V", "Visa Inc.", "Financials", "Payments", "North America", "United States", 5.5e11, 275, 0.14, 0.21, 0.96),
  s("JNJ", "Johnson & Johnson", "Health Care", "Pharmaceuticals", "North America", "United States", 3.8e11, 155, 0.07, 0.15, 0.58),
  s("UNH", "UnitedHealth Group", "Health Care", "Managed Care", "North America", "United States", 4.6e11, 500, 0.13, 0.22, 0.72),
  s("LLY", "Eli Lilly & Co.", "Health Care", "Pharmaceuticals", "North America", "United States", 7.5e11, 800, 0.28, 0.3, 0.69),
  s("XOM", "Exxon Mobil Corp.", "Energy", "Integrated Oil & Gas", "North America", "United States", 4.5e11, 110, 0.09, 0.27, 0.82),
  s("CVX", "Chevron Corp.", "Energy", "Integrated Oil & Gas", "North America", "United States", 2.8e11, 155, 0.08, 0.26, 0.79),
  s("PG", "Procter & Gamble", "Consumer Staples", "Household Products", "North America", "United States", 3.8e11, 165, 0.08, 0.14, 0.45),
  s("KO", "Coca-Cola Co.", "Consumer Staples", "Beverages", "North America", "United States", 2.7e11, 62, 0.07, 0.13, 0.5),
  s("WMT", "Walmart Inc.", "Consumer Staples", "Food Retail", "North America", "United States", 5.2e11, 65, 0.12, 0.16, 0.51),
  s("HD", "Home Depot Inc.", "Consumer Discretionary", "Home Improvement", "North America", "United States", 3.5e11, 350, 0.11, 0.22, 1.02),
  s("COST", "Costco Wholesale", "Consumer Staples", "Food Retail", "North America", "United States", 3.6e11, 820, 0.16, 0.18, 0.78),
  s("BAC", "Bank of America", "Financials", "Banks", "North America", "United States", 3.0e11, 40, 0.1, 0.27, 1.25),
  s("MA", "Mastercard Inc.", "Financials", "Payments", "North America", "United States", 4.2e11, 460, 0.15, 0.22, 1.04),
  s("DIS", "Walt Disney Co.", "Communication Services", "Entertainment", "North America", "United States", 1.8e11, 100, 0.06, 0.3, 1.18),
  s("NFLX", "Netflix Inc.", "Communication Services", "Entertainment", "North America", "United States", 2.9e11, 670, 0.2, 0.4, 1.28),
  s("ADBE", "Adobe Inc.", "Information Technology", "Software", "North America", "United States", 2.3e11, 520, 0.16, 0.3, 1.15),
  s("CRM", "Salesforce Inc.", "Information Technology", "Software", "North America", "United States", 2.5e11, 255, 0.15, 0.33, 1.22),
  s("INTC", "Intel Corp.", "Information Technology", "Semiconductors", "North America", "United States", 1.3e11, 31, 0.04, 0.38, 1.05),
  s("AMD", "Advanced Micro Devices", "Information Technology", "Semiconductors", "North America", "United States", 2.6e11, 160, 0.22, 0.48, 1.66),
  s("PFE", "Pfizer Inc.", "Health Care", "Pharmaceuticals", "North America", "United States", 1.6e11, 28, 0.03, 0.22, 0.62),
  s("T", "AT&T Inc.", "Communication Services", "Telecom", "North America", "United States", 1.3e11, 18, 0.05, 0.18, 0.66),
  s("NKE", "Nike Inc.", "Consumer Discretionary", "Apparel", "North America", "United States", 1.1e11, 75, 0.07, 0.27, 1.08),
  s("BA", "Boeing Co.", "Industrials", "Aerospace & Defense", "North America", "United States", 1.1e11, 180, 0.05, 0.38, 1.35),
  s("CAT", "Caterpillar Inc.", "Industrials", "Machinery", "North America", "United States", 1.6e11, 340, 0.13, 0.27, 1.12),
  s("GE", "General Electric", "Industrials", "Aerospace & Defense", "North America", "United States", 1.8e11, 165, 0.16, 0.3, 1.14),
  s("NEE", "NextEra Energy", "Utilities", "Electric Utilities", "North America", "United States", 1.5e11, 73, 0.07, 0.2, 0.55),
  s("PLD", "Prologis Inc.", "Real Estate", "Industrial REITs", "North America", "United States", 1.1e11, 115, 0.06, 0.25, 0.98),
  s("LIN", "Linde plc", "Materials", "Industrial Gases", "Europe", "United Kingdom", 2.1e11, 440, 0.12, 0.2, 0.86),
  s("ASML", "ASML Holding", "Information Technology", "Semiconductor Equipment", "Europe", "Netherlands", 3.5e11, 880, 0.21, 0.34, 1.3),
  s("TSM", "Taiwan Semiconductor", "Information Technology", "Semiconductors", "Asia Pacific", "Taiwan", 8.0e11, 155, 0.24, 0.32, 1.22),
  s("SPY", "SPDR S&P 500 ETF", "Information Technology", "Equity Index ETF", "North America", "United States", 5.0e11, 540, 0.1, 0.16, 1.0),
  s("QQQ", "Invesco QQQ Trust", "Information Technology", "Equity Index ETF", "North America", "United States", 2.8e11, 470, 0.13, 0.2, 1.12),
  s("VTI", "Vanguard Total Market", "Information Technology", "Equity Index ETF", "North America", "United States", 4.0e11, 270, 0.1, 0.16, 1.0),
];

function s(
  ticker: string,
  name: string,
  sector: Sector,
  industry: string,
  region: Region,
  country: string,
  marketCap: number,
  referencePrice: number,
  annualDrift: number,
  annualVol: number,
  beta: number,
): Seed {
  return {
    ticker,
    name,
    sector,
    industry,
    region,
    country,
    marketCap,
    currency: "USD",
    referencePrice,
    annualDrift,
    annualVol,
    beta,
  };
}

const CATALOG = new Map<string, InstrumentSeed>(
  RAW.map((seed) => [
    seed.ticker,
    { ...seed, marketCapBucket: bucketForMarketCap(seed.marketCap) },
  ]),
);

export function getSeed(ticker: string): InstrumentSeed | undefined {
  return CATALOG.get(ticker.toUpperCase());
}

export function catalogTickers(): InstrumentSeed[] {
  return Array.from(CATALOG.values());
}
