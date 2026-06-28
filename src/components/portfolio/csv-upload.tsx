"use client";

import * as React from "react";
import { Upload, FileWarning, Loader2 } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio";
import { cn } from "@/lib/utils";
import { parseHoldingsFile } from "@/lib/import/parse-holdings";

interface ImportResult {
  added: number;
  skipped: number;
  headerRow: number | null;
}

export function CsvUpload() {
  const addHoldings = usePortfolioStore((s) => s.addHoldings);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const outcome = await parseHoldingsFile(file);
      if (outcome.error) {
        setError(outcome.error);
        return;
      }
      if (outcome.holdings.length === 0) {
        setError("No valid holdings were found in the file.");
        return;
      }
      addHoldings(outcome.holdings);
      setResult({
        added: outcome.holdings.length,
        skipped: outcome.skipped,
        headerRow: outcome.headerRow,
      });
    } finally {
      setBusy(false);
    }
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
          if (file) void handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/50 px-6 py-10 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-70",
        )}
      >
        {busy ? (
          <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className="mb-3 h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {busy ? "Reading file…" : "Drop a CSV or Excel file here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepts .csv, .tsv, .xlsx and .xls — we auto-detect the holdings table.
        </p>
        <p className="mt-0.5 text-2xs text-muted-foreground/80">
          Needs columns for ticker, quantity and cost per share (any order, any labels).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls,.xlsm,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {result && (
        <p className="text-2xs text-positive">
          Imported {result.added} holding{result.added === 1 ? "" : "s"}
          {result.skipped > 0 ? ` · ${result.skipped} row(s) skipped` : ""}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-negative/30 bg-negative/10 p-3 text-xs text-negative">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
