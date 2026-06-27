"use client";

import * as React from "react";
import type { CorrelationMatrix } from "@/types";
import { correlationColor } from "./palette";
import { cn } from "@/lib/utils";

/** Compact correlation heatmap with hover detail. */
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

  const cell = 26;
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex">
          <div style={{ width: cell }} />
          {tickers.map((t) => (
            <div
              key={t}
              style={{ width: cell }}
              className="text-center text-[9px] font-medium text-muted-foreground"
            >
              {t.slice(0, 4)}
            </div>
          ))}
        </div>
        {tickers.map((rowT, i) => (
          <div key={rowT} className="flex items-center">
            <div
              style={{ width: cell }}
              className="pr-1 text-right text-[9px] font-medium text-muted-foreground"
            >
              {rowT.slice(0, 4)}
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
                    width: cell,
                    height: cell,
                    backgroundColor: correlationColor(v),
                  }}
                  className={cn(
                    "flex items-center justify-center border border-card text-[8px] font-medium text-white/80 transition-transform",
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
          <span className="ml-auto font-medium text-foreground">
            {tickers[hover.i]} · {tickers[hover.j]}:{" "}
            {m[hover.i]![hover.j]!.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
