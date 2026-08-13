"use client";

import { useMemo } from "react";
import Link from "next/link";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WinnerScoreBadge } from "@/components/products/winner-score-badge";
import { WatchlistButton } from "@/components/products/watchlist-button";
import { formatCurrency, formatPercent, marginPercent } from "@/lib/scoring/format";
import type { ProductListItem } from "./types";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, ProductListItem>();

const EMPTY_ROWS: ProductListItem[] = [];

export function RadarTable({ products }: { products: ProductListItem[] }) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
      columnHelper.accessor("title", {
        header: "Product",
        cell: (ctx) => {
          const p = ctx.row.original;
          return (
            <Link href={`/products/${p.id}`} className="flex items-center gap-2.5 font-medium hover:underline">
              <span className="line-clamp-1 max-w-64">{p.title}</span>
            </Link>
          );
        },
      }),
      columnHelper.accessor("sourceKey", {
        header: "Source",
        cell: (ctx) => <span className="text-muted-foreground capitalize">{ctx.getValue().replace(/-/g, " ")}</span>,
      }),
      columnHelper.accessor("category", { header: "Category" }),
      columnHelper.accessor("winnerScore", {
        header: "Score",
        cell: (ctx) => (
          <WinnerScoreBadge score={ctx.getValue()} classification={ctx.row.original.winnerClassification} size="sm" />
        ),
      }),
      columnHelper.accessor("searchGrowthPercent", {
        header: "Growth",
        cell: (ctx) => {
          const v = ctx.getValue();
          return (
            <span className={v !== null && v > 0 ? "text-success" : v !== null && v < 0 ? "text-destructive" : ""}>
              {formatPercent(v, { signed: true })}
            </span>
          );
        },
      }),
      columnHelper.accessor("cost", { header: "Cost", cell: (ctx) => formatCurrency(ctx.getValue()) }),
      columnHelper.accessor("sellingPriceEstimate", { header: "Sell", cell: (ctx) => formatCurrency(ctx.getValue()) }),
      columnHelper.display({
        id: "margin",
        header: "Margin",
        cell: (ctx) => {
          const m = marginPercent(ctx.row.original.cost, ctx.row.original.sellingPriceEstimate);
          return m !== null ? `${m.toFixed(0)}%` : "—";
        },
      }),
      columnHelper.accessor("competitionScore", {
        header: "Competition",
        cell: (ctx) => {
          const v = ctx.getValue();
          return v === null ? "—" : v < 34 ? "Low" : v < 67 ? "Medium" : "High";
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (ctx) => (
          <WatchlistButton productId={ctx.row.original.id} initialWatching={ctx.row.original.isWatching} size="icon" variant="ghost" />
        ),
      }),
      ]),
    []
  );

  const table = useTable({
    features,
    columns,
    data: products.length > 0 ? products : EMPTY_ROWS,
    getRowId: (row) => row.id,
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
