/**
 * Asset-class classification — two buckets only: Equity and Mutual Fund.
 *
 *   Equity        → listed instruments that trade on an exchange: direct stocks
 *                   AND exchange-traded funds (ETFs, incl. gold/silver/index
 *                   ETFs like GOLDBEES, NIFTYBEES, HNGSNGBEES).
 *   Mutual Fund   → open-ended schemes bought at NAV: equity, debt, liquid and
 *                   fund-of-funds / feeder funds (even when the name references
 *                   an "ETF" — a Nasdaq "ETF Fund of Fund" is still a MF).
 *
 * Inferred from the symbol / scheme name and ISIN (Indian fund ISINs start
 * "INF", equities "INE") — no securities master required.
 */
export type AssetClass = "Equity" | "Mutual Fund";

export function classifyAssetClass(ticker: string, isin?: string): AssetClass {
  const s = (ticker ?? "").toUpperCase().trim();
  if (!s) return "Mutual Fund";

  // Fund-of-funds / feeder schemes are open-ended MFs even if they track an ETF.
  if (/\bFOF\b/.test(s) || /FUND\s*OF\s*FUND/.test(s) || /FEEDER/.test(s)) {
    return "Mutual Fund";
  }

  // Genuine exchange-traded funds trade like equity.
  if (/\bETF\b/.test(s) || /BEES\b/.test(s)) return "Equity";

  // Open-ended mutual fund: multi-word scheme name, explicit fund/scheme/plan
  // wording, or an AMC-issued (INF…) ISIN.
  const isFundName = /\s/.test(s) || s.length > 18 || /\b(FUND|SCHEME|PLAN|MF)\b/.test(s);
  const isInfIsin = !!isin && /^INF/i.test(isin);
  if (isFundName || isInfIsin) return "Mutual Fund";

  // Otherwise a listed stock.
  return "Equity";
}

/* ---- Sub-categories (for the drill-down allocation pies) ---------------- */

export type EquityCategory = "Stocks" | "ETFs" | "Commodity";

/** Break the Equity bucket into direct stocks, index/other ETFs, and commodity
 *  (gold/silver) ETFs. Only meaningful for holdings already classed as Equity. */
export function classifyEquityCategory(ticker: string): EquityCategory {
  const s = (ticker ?? "").toUpperCase();
  if (/\b(GOLD|SILVER|COMMODIT|BULLION)\b/.test(s) || /GOLDBEES|SILVERBEES/.test(s)) {
    return "Commodity";
  }
  if (/\bETF\b/.test(s) || /BEES\b/.test(s)) return "ETFs";
  return "Stocks";
}

export type FundCategory =
  | "Equity Fund"
  | "Debt Fund"
  | "Hybrid Fund"
  | "Commodity Fund"
  | "Other";

/** Break the Mutual Fund bucket into equity / debt / hybrid / commodity funds.
 *  Only meaningful for holdings already classed as Mutual Fund. */
export function classifyFundCategory(ticker: string): FundCategory {
  const s = (ticker ?? "").toUpperCase();

  if (/\b(GOLD|SILVER|COMMODIT|BULLION)\b/.test(s)) return "Commodity Fund";

  if (
    /\b(DEBT|BOND|GILT|LIQUID|OVERNIGHT|DURATION|FLOATER|TREASURY|G-?SEC)\b/.test(s) ||
    /MONEY\s*MARKET|CORPORATE\s*BOND|CREDIT\s*RISK|BANKING\s*&?\s*PSU|INCOME\s*FUND/.test(s)
  ) {
    return "Debt Fund";
  }

  if (
    /\b(HYBRID|BALANCED|ARBITRAGE)\b/.test(s) ||
    /ASSET\s*ALLOCATION|MULTI\s*ASSET|EQUITY\s*SAVINGS|DYNAMIC\s*ASSET|BALANCED\s*ADVANTAGE/.test(s)
  ) {
    return "Hybrid Fund";
  }

  if (
    /\b(EQUITY|FLEXI|MULTICAP|MIDCAP|SMALLCAP|LARGECAP|INDEX|NIFTY|SENSEX|BLUECHIP|FOCUSED|ELSS|VALUE|CONTRA|NASDAQ|SECTORAL|THEMATIC|GROWTH|OPPORTUNITIES)\b/.test(s) ||
    /LARGE\s*CAP|MID\s*CAP|SMALL\s*CAP|MULTI\s*CAP|FLEXI\s*CAP|TAX\s*SAVER|DIVIDEND\s*YIELD|S&P|SP\s*500/.test(s)
  ) {
    return "Equity Fund";
  }

  return "Other";
}
