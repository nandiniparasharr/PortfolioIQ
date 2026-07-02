/**
 * Domain types for PortfolioIQ.
 *
 * These types are shared across the input layer, the market-data layer and
 * the analytics engine. They are intentionally framework-agnostic so the
 * analytics engine can be unit-tested in isolation.
 */

/** A single position as entered by the user. */
export interface Holding {
  /** Stable client-side id (uuid-ish). */
  id: string;
  /** Upper-cased ticker symbol, e.g. "AAPL". */
  ticker: string;
  /** Number of shares held. Must be > 0. */
  quantity: number;
  /** Optional cost basis per share. */
  purchasePrice?: number;
  /** Optional current/market price per share (overrides modeled price). */
  currentPrice?: number;
  /** Optional ISIN (used to resolve mutual-fund NAVs exactly). */
  isin?: string;
  /** Optional acquisition date (ISO yyyy-mm-dd). */
  purchaseDate?: string;
}

export type Sector =
  | "Information Technology"
  | "Financials"
  | "Health Care"
  | "Consumer Discretionary"
  | "Communication Services"
  | "Industrials"
  | "Consumer Staples"
  | "Energy"
  | "Utilities"
  | "Real Estate"
  | "Materials"
  | "Unknown";

export type Region =
  | "North America"
  | "Europe"
  | "Asia Pacific"
  | "Latin America"
  | "Middle East & Africa"
  | "Unknown";

export type MarketCapBucket =
  | "Mega Cap"
  | "Large Cap"
  | "Mid Cap"
  | "Small Cap"
  | "Micro Cap"
  | "Unknown";

/** Reference data describing an instrument, resolved by the market layer. */
export interface InstrumentMeta {
  ticker: string;
  name: string;
  sector: Sector;
  industry: string;
  region: Region;
  country: string;
  /** Market capitalization in USD. */
  marketCap: number;
  marketCapBucket: MarketCapBucket;
  currency: string;
}

/** A single end-of-day close. */
export interface PricePoint {
  /** ISO date. */
  date: string;
  close: number;
}

/** Full market snapshot for one instrument. */
export interface InstrumentData {
  meta: InstrumentMeta;
  /** Most recent close used for valuation. */
  lastPrice: number;
  /** Ascending daily close history (oldest first). */
  history: PricePoint[];
}

/** Everything the analytics engine needs about one position. */
export interface ResolvedPosition {
  holding: Holding;
  data: InstrumentData;
  /** quantity * lastPrice */
  marketValue: number;
  /** marketValue / portfolio market value, in [0, 1]. */
  weight: number;
  /** Unrealized gain in currency terms, if cost basis is known. */
  unrealizedGain?: number;
  /** Unrealized gain as a fraction of cost, if cost basis is known. */
  unrealizedReturn?: number;
}

export interface AllocationSlice {
  label: string;
  value: number;
  weight: number;
}

export interface CorrelationMatrix {
  tickers: string[];
  /** matrix[i][j] = pairwise correlation of daily returns. */
  matrix: number[][];
}

export interface ContributionRow {
  ticker: string;
  weight: number;
  /** Annualized standalone volatility. */
  volatility: number;
  /** Share of total portfolio variance attributable to this position. */
  riskContribution: number;
  /** Share of portfolio return attributable to this position. */
  returnContribution: number;
}

export interface RollingPoint {
  date: string;
  /** Annualized rolling volatility at this date. */
  volatility: number;
  /** Trailing cumulative return at this date. */
  cumulativeReturn: number;
}

/** The complete, deterministic analytics result. */
export interface PortfolioAnalytics {
  asOf: string;
  baseCurrency: string;
  totalValue: number;
  totalCost?: number;
  totalUnrealizedGain?: number;
  totalUnrealizedReturn?: number;

  positions: ResolvedPosition[];

  allocation: {
    byAssetClass: AllocationSlice[];
    bySector: AllocationSlice[];
    byRegion: AllocationSlice[];
    byMarketCap: AllocationSlice[];
    byHolding: AllocationSlice[];
  };

  performance: {
    /** Geometric annualized return of the weighted portfolio. */
    annualizedReturn: number;
    /** Annualized standard deviation of daily portfolio returns. */
    annualizedVolatility: number;
    cumulativeReturn: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    /** Portfolio beta versus the benchmark. */
    beta: number;
    /** Number of trading days in the analysis window. */
    observations: number;
    equityCurve: { date: string; value: number }[];
    rolling: RollingPoint[];
  };

  risk: {
    /** 1-day Historical Value at Risk at 95% (positive number = loss). */
    valueAtRisk95: number;
    valueAtRisk99: number;
    /** 1-day Conditional VaR (Expected Shortfall) at 95%. */
    conditionalVaR95: number;
    annualizedVolatility: number;
    contribution: ContributionRow[];
    correlation: CorrelationMatrix;
    /** Average pairwise correlation across distinct holdings. */
    averageCorrelation: number;
  };

  diversification: {
    /** Herfindahl-Hirschman Index of holding weights, in [0, 1]. */
    hhi: number;
    /** Effective number of holdings = 1 / HHI. */
    effectiveHoldings: number;
    /** Combined weight of the largest positions. */
    concentrationTop5: number;
    /** 0-100 composite diversification score. */
    score: number;
    holdingsCount: number;
    sectorCount: number;
  };

  scores: {
    /** 0-100 composite portfolio health score. */
    health: number;
    /** 0-100, higher = riskier. */
    risk: number;
    /** 0-100, higher = better diversified. */
    diversification: number;
  };

  warnings: string[];
}

/** Narrative commentary produced by the AI layer from the analytics above. */
export interface PortfolioCommentary {
  executiveSummary: string;
  riskCommentary: string;
  diversificationCommentary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: { title: string; detail: string; priority: 1 | 2 | 3 }[];
  generatedBy: "llm" | "deterministic";
}
