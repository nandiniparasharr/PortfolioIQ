"use client";

import * as React from "react";
import type { Holding, PortfolioAnalytics, PortfolioCommentary } from "@/types";
import type { Currency } from "@/lib/format";

interface AnalyzeResponse {
  analytics: PortfolioAnalytics;
  commentary: PortfolioCommentary;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Fetches deterministic analytics + commentary for a set of holdings.
 * Re-runs whenever the holdings signature changes.
 */
export function useAnalytics(holdings: Holding[], currency: Currency) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [data, setData] = React.useState<AnalyzeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Signature captures the inputs that affect the result.
  const signature = React.useMemo(
    () =>
      `${currency}|` +
      holdings
        .map((h) => `${h.ticker}:${h.quantity}:${h.purchasePrice ?? ""}`)
        .sort()
        .join("|"),
    [holdings, currency],
  );

  React.useEffect(() => {
    if (holdings.length === 0) {
      setStatus("idle");
      setData(null);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError(null);

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings, currency }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Request failed");
        return res.json();
      })
      .then((json: AnalyzeResponse) => {
        if (cancelled) return;
        setData(json);
        setStatus("success");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return { status, data, error };
}
