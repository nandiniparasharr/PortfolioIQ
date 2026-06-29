"use client";

import * as React from "react";
import type { CorrelationMatrix } from "@/types";
import { correlationColor } from "./palette";
import { cn } from "@/lib/utils";

const LABEL_W = 116; // readable row-label column
const CELL = 30;

/** Correlation heatmap with readable, full row labels (truncated with tooltip). */
export function CorrelationHeatmap({ matrix }: { matrix: CorrelationMatrix }) {
  const { tickers, matrix: m } = matrix;
  const [hover, setHover] = React.useState<{ i: number; j: number } | null>(null);

  if (tickers.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Correlation requires at least two holdings.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-block">
        {/* Column header */}
        <div className="flex">
          <div style={{ width: LABEL_W }} />
          {tickers.map((t, j) => (
            <div
              key={t}
              style={{ width: CELL }}
              title={t}
              className={cn(
                "overflow-hidden text-ellipsis whitespace-nowrap px-0.5 text-center text-[9px] font-medium",
                hover?.j === j ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t.slice(0, 4)}
            </div>
          ))}
        </div>

        {tickers.map((rowT, i) => (
          <div key={rowT} className="flex items-center">
            <div
              style={{ width: LABEL_W }}
              title={rowT}
              className={cn(
                "truncate pr-2 text-left text-[11px] font-medium leading-none",
                hover?.i === i ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {rowT}
            </div>
            {tickers.map((colT, j) => {
              const v = m[i]![j]!;
              const isHover = hover?.i === i && hover?.j === j;
              return (
                <div
                  key={colT}
                  onMouseEnter={() => setHover({ i, j })}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: CELL,
                    height: CELL,
                    backgroundColor: correlationColor(v),
                  }}
                  className={cn(
                    "flex items-center justify-center border border-card text-[8px] font-medium text-white/85 transition-transform",
                    isHover && "z-10 scale-110 ring-1 ring-white/40",
                  )}
                  title={`${rowT} · ${colT}: ${v.toFixed(2)}`}
                >
                  {i === j ? "" : v.toFixed(1).replace("0.", ".")}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-2xs text-muted-foreground">
        <span>−1.0</span>
        <div className="h-2 w-40 rounded-full bg-gradient-to-r from-[rgb(20,210,190)] via-[rgb(40,55,70)] to-[rgb(250,130,70)]" />
        <span>+1.0</span>
        {hover && (
          <span className="ml-auto truncate font-medium text-foreground">
            {tickers[hover.i]} · {tickers[hover.j]}: {m[hover.i]![hover.j]!.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
