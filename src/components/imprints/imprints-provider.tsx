"use client";

import * as React from "react";
import type { Imprint, ImprintInput } from "@/lib/imprints/types";

const MY_ID_KEY = "pilq_imprint_id";

type AddOutcome = { ok: true; imprint: Imprint } | { ok: false; error: string };

type ImprintsContextValue = {
  imprints: Imprint[];
  count: number;
  loading: boolean;
  myId: string | null;
  highlightId: string | null;
  add: (input: ImprintInput) => Promise<AddOutcome>;
  highlight: (id: string) => void;
};

const ImprintsContext = React.createContext<ImprintsContextValue | null>(null);

export function useImprints(): ImprintsContextValue {
  const ctx = React.useContext(ImprintsContext);
  if (!ctx) throw new Error("useImprints must be used within <ImprintsProvider>");
  return ctx;
}

export function ImprintsProvider({ children }: { children: React.ReactNode }) {
  const [imprints, setImprints] = React.useState<Imprint[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [myId, setMyId] = React.useState<string | null>(null);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const highlightTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    try {
      setMyId(localStorage.getItem(MY_ID_KEY));
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/imprints", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { imprints: Imprint[]; count: number };
        if (cancelled) return;
        setImprints(data.imprints ?? []);
        setCount(data.count ?? 0);
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const add = React.useCallback(async (input: ImprintInput): Promise<AddOutcome> => {
    try {
      const res = await fetch("/api/imprints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error ?? "Something went wrong. Please try again." };
      }
      const imprint = data.imprint as Imprint;
      setImprints((prev) => [...prev, imprint]);
      setCount((c) => c + 1);
      setMyId(imprint.id);
      try {
        localStorage.setItem(MY_ID_KEY, imprint.id);
      } catch {
        /* ignore */
      }
      return { ok: true, imprint };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const highlight = React.useCallback((id: string) => {
    setHighlightId(id);
    if (typeof document !== "undefined") {
      const el = document.getElementById(`imprint-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 4000);
  }, []);

  const value = React.useMemo(
    () => ({ imprints, count, loading, myId, highlightId, add, highlight }),
    [imprints, count, loading, myId, highlightId, add, highlight],
  );

  return <ImprintsContext.Provider value={value}>{children}</ImprintsContext.Provider>;
}
