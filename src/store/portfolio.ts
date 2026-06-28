"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Holding } from "@/types";
import { createId } from "@/lib/utils";
import { DEFAULT_CURRENCY, type Currency } from "@/lib/format";

/**
 * Portfolio input state.
 *
 * Persisted to sessionStorage only — data lives for the browser session and is
 * cleared when the tab closes, honoring the "processed locally, not stored"
 * commitment shown in the UI. No network, no database, no cross-session trace.
 */
interface PortfolioState {
  holdings: Holding[];
  /** Display currency for the whole session. */
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  addHolding: (holding: Omit<Holding, "id">) => void;
  addHoldings: (holdings: Omit<Holding, "id">[]) => void;
  updateHolding: (id: string, patch: Partial<Omit<Holding, "id">>) => void;
  removeHolding: (id: string) => void;
  clear: () => void;
}

/** Merge a new holding into an existing same-ticker position (weighted cost). */
function upsert(holdings: Holding[], incoming: Holding): Holding[] {
  const existingIndex = holdings.findIndex((h) => h.ticker === incoming.ticker);
  if (existingIndex === -1) return [...holdings, incoming];

  const existing = holdings[existingIndex]!;
  const totalQty = existing.quantity + incoming.quantity;
  let purchasePrice = existing.purchasePrice ?? incoming.purchasePrice;
  if (existing.purchasePrice != null && incoming.purchasePrice != null && totalQty > 0) {
    purchasePrice =
      (existing.purchasePrice * existing.quantity +
        incoming.purchasePrice * incoming.quantity) /
      totalQty;
  }
  const merged: Holding = {
    ...existing,
    quantity: totalQty,
    purchasePrice,
    currentPrice: incoming.currentPrice ?? existing.currentPrice,
    isin: incoming.isin ?? existing.isin,
  };
  const next = [...holdings];
  next[existingIndex] = merged;
  return next;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => set({ currency }),
      addHolding: (holding) =>
        set((state) => ({
          holdings: upsert(state.holdings, { ...holding, id: createId() }),
        })),
      addHoldings: (incoming) =>
        set((state) => {
          let next = state.holdings;
          for (const h of incoming) next = upsert(next, { ...h, id: createId() });
          return { holdings: next };
        }),
      updateHolding: (id, patch) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.id === id ? { ...h, ...patch } : h,
          ),
        })),
      removeHolding: (id) =>
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        })),
      clear: () => set({ holdings: [] }),
    }),
    {
      name: "portfolioiq.holdings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : undefined!,
      ),
    },
  ),
);
