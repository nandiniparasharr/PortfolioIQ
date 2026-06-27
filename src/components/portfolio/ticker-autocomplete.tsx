"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TickerResult {
  ticker: string;
  name: string;
  sector: string;
}

/**
 * Ticker search with debounced lookups against the catalog endpoint.
 * Free-form symbols are still allowed — the catalog only assists discovery.
 */
export function TickerAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (ticker: string) => void;
}) {
  const [results, setResults] = React.useState<TickerResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    const q = value.trim();
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tickers?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!cancelled) {
          setResults(json.results ?? []);
          setActive(0);
        }
      } catch {
        if (!cancelled) setResults([]);
      }
    }, 160);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [value]);

  const choose = (ticker: string) => {
    onChange(ticker);
    onSelect?.(ticker);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + results.length) % results.length);
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              choose(results[active]!.ticker);
            }
          }}
          placeholder="Search ticker e.g. AAPL"
          className="pl-8 uppercase"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface-raised shadow-lg">
          {results.map((r, i) => (
            <button
              key={r.ticker}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(r.ticker)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                i === active ? "bg-surface-muted" : "hover:bg-surface-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-primary">
                  {r.ticker}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.name}
                </span>
              </span>
              <span className="shrink-0 text-2xs text-muted-foreground">
                {r.sector}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
