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
