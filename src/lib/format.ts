/** Presentation-layer formatting helpers. All are pure and locale-stable. */

export type Currency = "USD" | "INR";

export const DEFAULT_CURRENCY: Currency = "INR";

const LOCALE: Record<Currency, string> = { USD: "en-US", INR: "en-IN" };
const SYMBOL: Record<Currency, string> = { USD: "$", INR: "₹" };

export const CURRENCY_META: Record<Currency, { code: Currency; symbol: string; label: string }> = {
  INR: { code: "INR", symbol: "₹", label: "INR" },
  USD: { code: "USD", symbol: "$", label: "USD" },
};

function moneyFormatter(currency: Currency, precise: boolean): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: precise ? 2 : 0,
    maximumFractionDigits: precise ? 2 : 0,
  });
}

export function formatCurrency(
  value: number,
  currency: Currency = DEFAULT_CURRENCY,
  precise = false,
): string {
  if (!Number.isFinite(value)) return "—";
  return moneyFormatter(currency, precise).format(value);
}

/**
 * Abbreviated currency for large figures. Uses the Indian numbering system
 * (Lakh / Crore) for INR and the Western system (K/M/B/T) for USD.
 */
export function formatCompactCurrency(
  value: number,
  currency: Currency = DEFAULT_CURRENCY,
): string {
  if (!Number.isFinite(value)) return "—";
  const sym = SYMBOL[currency];
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (currency === "INR") {
    if (abs >= 1e7) return `${sign}${sym}${(abs / 1e7).toFixed(2)}Cr`;
    if (abs >= 1e5) return `${sign}${sym}${(abs / 1e5).toFixed(2)}L`;
    if (abs >= 1e3) return `${sign}${sym}${(abs / 1e3).toFixed(1)}K`;
    return `${sign}${sym}${abs.toFixed(0)}`;
  }
  if (abs >= 1e12) return `${sign}${sym}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${sym}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${sym}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${sym}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${sym}${abs.toFixed(0)}`;
}

/** Decimal fraction -> percent string, e.g. 0.1234 -> "12.34%". */
export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/** Signed percent for returns, e.g. +12.34% / -4.10%. */
export function formatSignedPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** The platform's default timezone — Indian Standard Time. */
export const APP_TIME_ZONE = "Asia/Kolkata";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

/** Current date in IST as ISO yyyy-mm-dd (used for "as of" stamps). */
export function todayInIST(): string {
  // en-CA renders ISO-style yyyy-mm-dd.
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(
    new Date(),
  );
}

/** Full date + time in IST, e.g. "28 Jun 2026, 14:32 IST". */
export function formatDateTimeIST(date: Date = new Date()): string {
  const formatted = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });
  return `${formatted} IST`;
}

/** Time only in IST, e.g. "14:32:05 IST". */
export function formatTimeIST(date: Date = new Date()): string {
  const formatted = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });
  return `${formatted} IST`;
}
