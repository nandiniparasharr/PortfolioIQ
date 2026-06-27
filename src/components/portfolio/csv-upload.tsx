"use client";

import * as React from "react";
import Papa from "papaparse";
import { Upload, FileWarning, Download } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Flexible header aliases so common broker exports import cleanly. */
const HEADER_ALIASES: Record<string, string[]> = {
  ticker: ["ticker", "symbol", "stock", "security"],
  quantity: ["quantity", "shares", "qty", "units", "amount"],
  purchasePrice: ["purchaseprice", "price", "cost", "costbasis", "avgcost", "averagecost"],
  purchaseDate: ["purchasedate", "date", "acquired", "buydate", "tradedate"],
};

function resolveField(headers: string[], field: string): string | undefined {
  const aliases = HEADER_ALIASES[field] ?? [];
  return headers.find((h) =>
    aliases.includes(h.toLowerCase().replace(/[\s_]/g, "")),
  );
}

interface ParsedResult {
  added: number;
  skipped: number;
}

export function CsvUpload() {
  const addHoldings = usePortfolioStore((s) => s.addHoldings);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ParsedResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (parsed) => {
        const headers = parsed.meta.fields ?? [];
        const tickerKey = resolveField(headers, "ticker");
        const qtyKey = resolveField(headers, "quantity");
        if (!tickerKey || !qtyKey) {
          setError(
            "Could not find required columns. A 'ticker' and 'quantity' column are needed.",
          );
          return;
        }
        const priceKey = resolveField(headers, "purchasePrice");
        const dateKey = resolveField(headers, "purchaseDate");

        const holdings: {
          ticker: string;
          quantity: number;
          purchasePrice?: number;
          purchaseDate?: string;
        }[] = [];
        let skipped = 0;

        for (const row of parsed.data) {
          const ticker = (row[tickerKey] ?? "").toString().trim().toUpperCase();
          const quantity = Number((row[qtyKey] ?? "").toString().replace(/[, ]/g, ""));
          if (!ticker || !Number.isFinite(quantity) || quantity <= 0) {
            skipped++;
            continue;
          }
          const priceRaw = priceKey ? Number((row[priceKey] ?? "").toString().replace(/[$, ]/g, "")) : NaN;
          const dateRaw = dateKey ? (row[dateKey] ?? "").toString().trim() : "";
          holdings.push({
            ticker,
            quantity,
            purchasePrice: Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : undefined,
            purchaseDate: /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : undefined,
          });
        }

        if (holdings.length === 0) {
          setError("No valid rows found in the file.");
          return;
        }
        addHoldings(holdings);
        setResult({ added: holdings.length, skipped });
      },
      error: () => setError("Failed to parse the file."),
    });
  };

  const downloadTemplate = () => {
    const csv = "ticker,quantity,purchasePrice,purchaseDate\nAAPL,50,152.30,2023-06-15\nMSFT,30,310.00,2023-08-01\nNVDA,20,,\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolioiq-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/50 px-6 py-10 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <Upload className="mb-3 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drop a CSV here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Columns: ticker, quantity, purchasePrice (optional), purchaseDate (optional)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5" />
          Download template
        </Button>
        {result && (
          <p className="text-2xs text-positive">
            Imported {result.added} holding{result.added === 1 ? "" : "s"}
            {result.skipped > 0 ? ` · ${result.skipped} row(s) skipped` : ""}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-negative/30 bg-negative/10 p-3 text-xs text-negative">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
