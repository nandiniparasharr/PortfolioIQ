/**
 * Asset-class classification.
 *
 * Unlike sector/geography (which need a securities master we don't have), the
 * broad asset class of a holding can be inferred reliably from its symbol /
 * scheme name and ISIN:
 *   - Mutual-fund scheme names are long / contain spaces, and Indian fund &
 *     ETF ISINs start with "INF" (equities start "INE").
 *   - Debt, gold and ETF wrappers are evident from well-known name keywords.
 */
export type AssetClass =
  | "Equity"
  | "Mutual Fund"
  | "ETF"
  | "Debt"
  | "Gold / Commodity"
  | "Other";

export function classifyAssetClass(ticker: string, isin?: string): AssetClass {
  const s = (ticker ?? "").toUpperCase().trim();
  if (!s) return "Other";

  const isFundName = /\s/.test(s) || s.length > 18;
  const isInfIsin = !!isin && /^INF/i.test(isin);

  // Gold / silver / commodity — whether wrapped as a fund or an ETF.
  if (/\b(GOLD|SILVER|COMMODIT|BULLION)\b/.test(s) || /GOLDBEES|SILVERBEES/.test(s)) {
    return "Gold / Commodity";
  }

  // Fixed income / debt schemes.
  if (
    /\b(DEBT|BOND|GILT|LIQUID|OVERNIGHT|DURATION|FLOATER|TREASURY|INCOME\s?FUND|G-?SEC)\b/.test(s) ||
    /MONEY\s?MARKET|MONEY-?MARKET|CORPORATE\s?BOND|DYNAMIC\s?BOND|CREDIT\s?RISK|BANKING\s?&?\s?PSU/.test(s)
  ) {
    return "Debt";
  }

  // Exchange-traded funds (index/thematic). Indian ETFs commonly end in "BEES".
  if (/\bETF\b/.test(s) || /BEES$/.test(s) || /\bIETF\b/.test(s)) {
    return "ETF";
  }

  // Remaining mutual-fund schemes.
  if (isFundName || isInfIsin) return "Mutual Fund";

  return "Equity";
}
