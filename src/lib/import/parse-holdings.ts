import Papa from "papaparse";

/**
 * Robust holdings import for CSV, TSV and Excel (.xlsx/.xls) files.
 *
 * The parser does NOT assume the table starts at row 1 or uses exact headers.
 * It loads the file into a 2-D grid of cells, scans the first rows to locate
 * the header (the first row that maps to at least a ticker and quantity
 * column), then reads the rows beneath it. Column matching is fuzzy, so common
 * broker / spreadsheet exports import without reformatting.
 *
 * Cost per share is REQUIRED: rows missing a positive price are skipped.
 */

export interface ParsedHolding {
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  purchaseDate?: string;
}

export interface ParseOutcome {
  holdings: ParsedHolding[];
  skipped: number;
  /** Zero-based index of the detected header row, for user feedback. */
  headerRow: number | null;
  error?: string;
}

type Field = "ticker" | "quantity" | "purchasePrice" | "currentPrice" | "purchaseDate";

/** Substrings that, if present in a normalized header, map it to a field. */
const FIELD_MATCHERS: Record<Field, string[]> = {
  // Includes mutual-fund identifiers (scheme / fund name / ISIN) so MF rows,
  // which have no ticker symbol, are recognised too.
  ticker: ["ticker", "symbol", "stock", "security", "instrument", "scheme", "fundname", "isin"],
  quantity: ["quantity", "shares", "qty", "units", "position", "noofshares", "numberofshares"],
  purchasePrice: ["avgcost", "averageprice", "avgprice", "buyprice", "costpershare", "cost", "basis", "paid", "price"],
  currentPrice: ["currentprice", "currentnav", "marketprice", "lasttraded", "lastprice", "ltp", "cmp", "nav", "currentmarketprice"],
  purchaseDate: ["date", "acquired", "purchased", "tradedate", "buydate"],
};

const normalize = (s: unknown): string =>
  String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function matchField(header: string): Field | null {
  const n = normalize(header);
  if (!n) return null;
  // Order matters: more specific fields are checked before generic "price".
  for (const sub of FIELD_MATCHERS.purchaseDate) if (n.includes(sub)) return "purchaseDate";
  for (const sub of FIELD_MATCHERS.ticker) if (n.includes(sub)) return "ticker";
  for (const sub of FIELD_MATCHERS.quantity) if (n.includes(sub)) return "quantity";
  for (const sub of FIELD_MATCHERS.currentPrice) if (n.includes(sub)) return "currentPrice";
  for (const sub of FIELD_MATCHERS.purchasePrice) if (n.includes(sub)) return "purchasePrice";
  return null;
}

/** Map a candidate header row to column indices. */
function mapHeaderRow(row: unknown[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  row.forEach((cell, i) => {
    const field = matchField(cell as string);
    // First match wins so we don't overwrite an earlier, better column.
    if (field && map[field] === undefined) map[field] = i;
  });
  return map;
}

/** Find the header row: first row (within the top 25) resolving ticker+qty. */
function detectHeader(grid: unknown[][]): {
  index: number;
  columns: Partial<Record<Field, number>>;
} | null {
  const limit = Math.min(grid.length, 25);
  for (let r = 0; r < limit; r++) {
    const columns = mapHeaderRow(grid[r] ?? []);
    if (columns.ticker !== undefined && columns.quantity !== undefined) {
      return { index: r, columns };
    }
  }
  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[$£€,\s]/g, "");
  return Number(cleaned);
}

/**
 * Accept both ticker symbols ("ITC", "EMBASSY-RR") and longer fund/scheme
 * identifiers ("Axis Bluechip Fund - Direct Growth", an ISIN). Must contain a
 * letter and not be a pure number; capped to a sane length.
 */
function isValidIdentifier(s: string): boolean {
  if (!s || s.length > 64) return false;
  if (/^\d+(\.\d+)?$/.test(s)) return false;
  return /[A-Za-z]/.test(s);
}

/** Normalize a variety of date inputs to ISO yyyy-mm-dd, else undefined. */
function normalizeDate(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // M/D/YYYY or D/M/YYYY style — assume US M/D/YYYY.
  const slash = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (slash) {
    const [, m, d, rawYear] = slash;
    const year = rawYear!.length === 2 ? `20${rawYear}` : rawYear!;
    const month = m!.padStart(2, "0");
    const day = d!.padStart(2, "0");
    if (Number(month) <= 12 && Number(day) <= 31) return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    if (year >= 1970 && year <= 2100) return parsed.toISOString().slice(0, 10);
  }
  return undefined;
}

/** Convert a detected grid + header mapping into holdings. */
function gridToHoldings(grid: unknown[][]): ParseOutcome {
  const header = detectHeader(grid);
  if (!header) {
    return {
      holdings: [],
      skipped: 0,
      headerRow: null,
      error:
        "Couldn't find a holdings table. Make sure the file has columns for ticker/symbol, quantity and cost per share.",
    };
  }

  const { columns } = header;
  if (columns.purchasePrice === undefined) {
    return {
      holdings: [],
      skipped: 0,
      headerRow: header.index,
      error:
        "Cost per share is required, but no price/cost column was found. Add a 'Cost per share' (or 'Price') column.",
    };
  }

  const holdings: ParsedHolding[] = [];
  let skipped = 0;

  for (let r = header.index + 1; r < grid.length; r++) {
    const row = grid[r] ?? [];
    if (row.every((c) => String(c ?? "").trim() === "")) continue; // blank row

    const ticker = String(row[columns.ticker!] ?? "").trim().toUpperCase();
    const quantity = toNumber(row[columns.quantity!]);
    const price = toNumber(row[columns.purchasePrice!]);

    if (!isValidIdentifier(ticker) || !Number.isFinite(quantity) || quantity <= 0) {
      skipped++;
      continue;
    }
    if (!Number.isFinite(price) || price <= 0) {
      skipped++; // cost per share is required
      continue;
    }

    const current =
      columns.currentPrice !== undefined ? toNumber(row[columns.currentPrice]) : NaN;

    holdings.push({
      ticker,
      quantity,
      purchasePrice: price,
      currentPrice: Number.isFinite(current) && current > 0 ? current : undefined,
      purchaseDate:
        columns.purchaseDate !== undefined
          ? normalizeDate(row[columns.purchaseDate])
          : undefined,
    });
  }

  if (holdings.length === 0 && !skipped) {
    return {
      holdings,
      skipped,
      headerRow: header.index,
      error: "No data rows were found beneath the detected header.",
    };
  }

  return { holdings, skipped, headerRow: header.index };
}

async function readCsv(file: File): Promise<unknown[][]> {
  const text = await file.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return parsed.data;
}

interface SheetGrid {
  name: string;
  grid: unknown[][];
}

async function readExcelSheets(buffer: ArrayBuffer): Promise<SheetGrid[]> {
  // Loaded on demand so the (large) spreadsheet parser stays out of the
  // initial bundle and is only fetched when an Excel file is imported.
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheets: SheetGrid[] = [];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });
    sheets.push({ name, grid });
  }
  return sheets;
}

/** Sheet names that denote an already-consolidated holdings tab. */
const COMBINED_SHEET_RE = /combined|consolidat|overall|all\s*holdings/i;

/**
 * Build holdings from a multi-sheet workbook.
 *   - If a sheet looks "combined/consolidated", use only that sheet (avoids
 *     double-counting positions that also appear on per-category tabs).
 *   - Otherwise, merge holdings from every sheet that contains a table, so
 *     separate tabs (e.g. "Equity" + "Mutual Funds") are all included.
 */
function holdingsFromSheets(sheets: SheetGrid[]): ParseOutcome {
  const withTable = sheets.filter((s) => detectHeader(s.grid) !== null);
  if (withTable.length === 0) {
    return {
      holdings: [],
      skipped: 0,
      headerRow: null,
      error:
        "Couldn't find a holdings table in any sheet. Make sure a sheet has columns for ticker/symbol, quantity and cost per share.",
    };
  }

  const combined = withTable.find((s) => COMBINED_SHEET_RE.test(s.name));
  if (combined) return gridToHoldings(combined.grid);

  const merged: ParsedHolding[] = [];
  let skipped = 0;
  let firstHeader: number | null = null;
  for (const s of withTable) {
    const out = gridToHoldings(s.grid);
    if (firstHeader === null) firstHeader = out.headerRow;
    merged.push(...out.holdings);
    skipped += out.skipped;
  }
  return { holdings: merged, skipped, headerRow: firstHeader };
}

/** Parse a user-supplied file into holdings. */
export async function parseHoldingsFile(file: File): Promise<ParseOutcome> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
      const sheets = await readExcelSheets(await file.arrayBuffer());
      if (sheets.length === 0 || sheets.every((s) => s.grid.length === 0)) {
        return { holdings: [], skipped: 0, headerRow: null, error: "The file appears to be empty." };
      }
      return holdingsFromSheets(sheets);
    }

    const grid = await readCsv(file);
    if (grid.length === 0) {
      return { holdings: [], skipped: 0, headerRow: null, error: "The file appears to be empty." };
    }
    return gridToHoldings(grid);
  } catch {
    return {
      holdings: [],
      skipped: 0,
      headerRow: null,
      error: "Could not read the file. Supported formats: CSV, TSV, XLSX, XLS.",
    };
  }
}
