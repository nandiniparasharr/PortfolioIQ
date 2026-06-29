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

/**
 * Score an AMFI scheme against the user's scheme name.
 *
 * Uses COVERAGE (how many of the user's words appear in the scheme name)
 * rather than Jaccard, so the scheme's many extra official words ("Fund of
 * Funds", "Direct", "Plan", ...) don't dilute a genuine match. Plan
 * (Direct/Regular) and option (Growth/IDCW) act as tie-breakers, defaulting to
 * Direct + Growth when the user didn't specify, so the right variant's NAV is
 * chosen among near-duplicates.
 */
function scoreEntry(target: Set<string>, entry: NameEntry): { ok: boolean; score: number } {
  let inter = 0;
  for (const t of target) if (entry.tokens.has(t)) inter++;
  const coverage = inter / target.size;
  if (inter < 3 || coverage < 0.6) return { ok: false, score: 0 };

  let score = coverage * 100 + inter;
  const e = entry.tokens;
  const wantsRegular = target.has("regular");
  const wantsDirect = target.has("direct") || !wantsRegular; // default to direct
  if (wantsDirect && e.has("direct")) score += 6;
  if (wantsRegular && e.has("regular")) score += 6;
  const wantsIdcw = target.has("idcw") || target.has("dividend");
  const wantsGrowth = target.has("growth") || !wantsIdcw; // default to growth
  if (wantsGrowth && e.has("growth")) score += 4;
  if (wantsIdcw && (e.has("idcw") || e.has("dividend"))) score += 4;
  return { ok: true, score };
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
      const { ok, score } = scoreEntry(target, entry);
      if (ok && score > best) {
        best = score;
        bestNav = entry.nav;
      }
    }
    return bestNav;
  }
  return null;
}
