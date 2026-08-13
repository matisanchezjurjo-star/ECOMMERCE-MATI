"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, ScatterChart as ScatterIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import { RadarFilters, DEFAULT_FILTERS, type RadarFilterState } from "./radar-filters";
import { RadarTable } from "./radar-table";
import { RadarScatter } from "./radar-scatter";
import type { ProductListResponse, RadarFacets } from "./types";

type ViewMode = "cards" | "table" | "chart";

function buildQueryString(filters: RadarFilterState, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.source !== "all") params.set("source", filters.source);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.country !== "all") params.set("country", filters.country);
  params.set("sort", filters.sort);
  if (filters.minWinnerScore > 0) params.set("minWinnerScore", String(filters.minWinnerScore));
  if (filters.minMargin > 0) params.set("minMargin", String(filters.minMargin));
  if (filters.maxCompetition < 100) params.set("maxCompetition", String(filters.maxCompetition));
  if (filters.maxSaturation < 100) params.set("maxSaturation", String(filters.maxSaturation));
  if (filters.minGrowth > -100) params.set("minGrowth", String(filters.minGrowth));
  if (filters.maxShippingDays < 60) params.set("maxShippingDays", String(filters.maxShippingDays));
  params.set("page", String(page));
  params.set("pageSize", "24");
  return params.toString();
}

export function RadarView({
  facets,
  initialFilters,
  title,
  description,
}: {
  facets: RadarFacets;
  initialFilters?: Partial<RadarFilterState>;
  title: string;
  description: string;
}) {
  const [filters, setFilters] = useState<RadarFilterState>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("cards");

  const queryString = useMemo(() => buildQueryString(filters, page), [filters, page]);

  const { data, isLoading, isError } = useQuery<ProductListResponse>({
    queryKey: ["products", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryString}`);
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  function handleFilterChange(patch: Partial<RadarFilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RadarFilters facets={facets} filters={filters} onChange={handleFilterChange} />
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="cards"><LayoutGrid className="size-3.5" /></TabsTrigger>
            <TabsTrigger value="table"><List className="size-3.5" /></TabsTrigger>
            <TabsTrigger value="chart"><ScatterIcon className="size-3.5" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {data && (
        <p className="text-xs text-muted-foreground">
          {data.total} product{data.total === 1 ? "" : "s"} found
        </p>
      )}

      {isLoading && !data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Couldn&apos;t load products. Try adjusting your filters.
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">
          No products match these filters.
        </div>
      ) : view === "cards" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} isWatching={p.isWatching} />
          ))}
        </div>
      ) : view === "table" ? (
        <RadarTable products={data.items} />
      ) : (
        <RadarScatter products={data.items} />
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
