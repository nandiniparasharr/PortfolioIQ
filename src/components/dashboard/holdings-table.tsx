"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ResolvedPosition } from "@/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  type Currency,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { PriceSourceTag } from "./price-source-tag";

export function HoldingsTable({
  positions,
  currency,
}: {
  positions: ResolvedPosition[];
  currency: Currency;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "weight", desc: true },
  ]);

  const columns = React.useMemo<ColumnDef<ResolvedPosition>[]>(
    () => [
      {
        accessorFn: (p) => p.data.meta.ticker,
        id: "ticker",
        header: "Ticker",
        cell: (ctx) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-primary">
              {ctx.row.original.data.meta.ticker}
            </span>
            <span className="max-w-[160px] truncate text-2xs text-muted-foreground">
              {ctx.row.original.data.meta.name}
            </span>
          </div>
        ),
      },
      {
        accessorFn: (p) => p.data.meta.sector,
        id: "sector",
        header: "Sector",
        cell: (ctx) => (
          <span className="text-xs text-muted-foreground">
            {ctx.row.original.data.meta.sector}
          </span>
        ),
      },
      {
        accessorFn: (p) => p.weight,
        id: "weight",
        header: "Weight",
        meta: { align: "right" },
        cell: (ctx) => (
          <span className="tabular font-medium">
            {formatPercent(ctx.row.original.weight)}
          </span>
        ),
      },
      {
        accessorFn: (p) => p.holding.quantity,
        id: "quantity",
        header: "Qty",
        meta: { align: "right" },
        cell: (ctx) => (
          <span className="tabular">{ctx.row.original.holding.quantity}</span>
        ),
      },
      {
        accessorFn: (p) => p.holding.purchasePrice ?? 0,
        id: "avgPrice",
        header: "Avg Price",
        meta: { align: "right" },
        cell: (ctx) => (
          <span className="tabular text-muted-foreground">
            {ctx.row.original.holding.purchasePrice
              ? formatCurrency(ctx.row.original.holding.purchasePrice, currency, true)
              : "—"}
          </span>
        ),
      },
      {
        accessorFn: (p) => p.data.lastPrice,
        id: "currentPrice",
        header: "Current Price",
        meta: { align: "right" },
        cell: (ctx) => (
          <div className="flex flex-col items-end">
            <span className="tabular">
              {formatCurrency(ctx.row.original.data.lastPrice, currency, true)}
            </span>
            <PriceSourceTag source={ctx.row.original.data.priceSource} />
          </div>
        ),
      },
      {
        accessorFn: (p) => p.marketValue,
        id: "marketValue",
        header: "Market Value",
        meta: { align: "right" },
        cell: (ctx) => (
          <span className="tabular">
            {formatCompactCurrency(ctx.row.original.marketValue, currency)}
          </span>
        ),
      },
      {
        accessorFn: (p) => p.unrealizedReturn ?? -Infinity,
        id: "unrealized",
        header: "Unrealized",
        meta: { align: "right" },
        cell: (ctx) => {
          const r = ctx.row.original.unrealizedReturn;
          if (r === undefined)
            return <span className="text-muted-foreground">—</span>;
          return (
            <span className={cn("tabular", r >= 0 ? "text-positive" : "text-negative")}>
              {formatSignedPercent(r)}
            </span>
          );
        },
      },
    ],
    [currency],
  );

  const table = useReactTable({
    data: positions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border bg-surface-muted">
              {hg.headers.map((header) => {
                const align = (header.column.columnDef.meta as { align?: string })?.align;
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "cursor-pointer select-none px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground",
                      align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        align === "right" && "flex-row-reverse",
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : sorted === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-surface-muted/50"
            >
              {row.getVisibleCells().map((cell) => {
                const align = (cell.column.columnDef.meta as { align?: string })?.align;
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      "px-4 py-2.5",
                      align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
