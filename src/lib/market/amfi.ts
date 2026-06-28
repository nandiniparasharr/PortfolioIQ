import "server-only";

/**
 * AMFI mutual-fund NAV provider.
 *
 * AMFI publishes the latest NAV for every Indian mutual-fund scheme as a daily
 * semicolon-delimited file. We fetch it once (cached for hours), index it by
 * ISIN and by normalized scheme name, and resolve a fund's current NAV by ISIN
 * (exact) or by a fuzzy scheme-name match. Any failure returns null so the
 * caller falls back to the user's cost basis.
 *
 * File columns:
 *   Scheme Code;ISIN Growth;ISIN Reinvest;Scheme Name;Net Asset Value;Date
 */

const NAV_URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const BREAKER_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 9000;

interface NameEntry {
  tokens: Set<string>;
  nav: number;
}
interface AmfiData {
  byIsin: Map<string, number>;
  names: NameEntry[];
  expires: number;
}

let cache: AmfiData | null = null;
let disabledUntil = 0;

/** Significant words to drop when comparing scheme names. */
const STOPWORDS = new Set(["plan", "option", "the", "fund", "scheme"]);

function tokenize(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
  );
}

async function load(): Promise<AmfiData> {
  if (cache && cache.expires > Date.now()) return cache;

  const res = await fetch(NAV_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`AMFI HTTP ${res.status}`);
  const text = await res.text();

  const byIsin = new Map<string, number>();
  const names: NameEntry[] = [];
  for (const line of text.split("\n")) {
    if (!line.includes(";")) continue; // skip section headers / blanks
    const parts = line.split(";");
    if (parts.length < 5) continue;
    const isin1 = parts[1]?.trim();
    const isin2 = parts[2]?.trim();
    const name = parts[3]?.trim();
    const nav = Number.parseFloat(parts[4] ?? "");
    if (!name || !Number.isFinite(nav) || nav <= 0) continue;
    if (isin1 && isin1 !== "-") byIsin.set(isin1.toUpperCase(), nav);
    if (isin2 && isin2 !== "-") byIsin.set(isin2.toUpperCase(), nav);
    names.push({ tokens: tokenize(name), nav });
  }

  cache = { byIsin, names, expires: Date.now() + TTL_MS };
  return cache;
}

/** Jaccard-style overlap of two token sets. */
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Resolve a fund's latest NAV.
 * @param isin Optional ISIN for an exact match.
 * @param name Scheme name for a fuzzy match when ISIN is unavailable/unknown.
 */
export async function fetchMfNav(
  isin: string | undefined,
  name: string | undefined,
): Promise<number | null> {
  if (Date.now() < disabledUntil) return null;
  let data: AmfiData;
  try {
    data = await load();
  } catch {
    disabledUntil = Date.now() + BREAKER_MS;
    return null;
  }

  if (isin) {
    const nav = data.byIsin.get(isin.trim().toUpperCase());
    if (nav) return nav;
  }
  if (name) {
    const target = tokenize(name);
    if (target.size === 0) return null;
    let best = 0;
    let bestNav: number | null = null;
    for (const entry of data.names) {
      const score = overlap(target, entry.tokens);
      if (score > best) {
        best = score;
        bestNav = entry.nav;
      }
    }
    // Require a strong match to avoid returning an unrelated scheme's NAV.
    if (best >= 0.6) return bestNav;
  }
  return null;
}
