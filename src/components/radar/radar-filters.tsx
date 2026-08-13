"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SortOption } from "@/lib/products/filters";
import type { RadarFacets } from "./types";

export interface RadarFilterState {
  q: string;
  source: string;
  category: string;
  country: string;
  sort: SortOption;
  minWinnerScore: number;
  minMargin: number;
  maxCompetition: number;
  maxSaturation: number;
  minGrowth: number;
  maxShippingDays: number;
}

export const DEFAULT_FILTERS: RadarFilterState = {
  q: "",
  source: "all",
  category: "all",
  country: "all",
  sort: "winnerScore",
  minWinnerScore: 0,
  minMargin: 0,
  maxCompetition: 100,
  maxSaturation: 100,
  minGrowth: -100,
  maxShippingDays: 60,
};

const SORT_LABELS: Record<SortOption, string> = {
  winnerScore: "Winner Score",
  growth: "Growth",
  margin: "Margin",
  competition: "Lowest competition",
  newest: "Newest",
  viral: "Most viral",
};

function countActiveAdvanced(f: RadarFilterState): number {
  let n = 0;
  if (f.minWinnerScore > 0) n++;
  if (f.minMargin > 0) n++;
  if (f.maxCompetition < 100) n++;
  if (f.maxSaturation < 100) n++;
  if (f.minGrowth > -100) n++;
  if (f.maxShippingDays < 60) n++;
  if (f.country !== "all") n++;
  return n;
}

export function RadarFilters({
  facets,
  filters,
  onChange,
}: {
  facets: RadarFacets;
  filters: RadarFilterState;
  onChange: (patch: Partial<RadarFilterState>) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const activeAdvanced = countActiveAdvanced(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search products..."
          defaultValue={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="w-full sm:w-56"
        />

        <Select value={filters.category} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {facets.categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(v) => onChange({ source: v })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {facets.sources.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => onChange({ sort: v as SortOption })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              Filters
              {activeAdvanced > 0 && (
                <Badge variant="secondary" className="ml-0.5 px-1.5">
                  {activeAdvanced}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="flex flex-col gap-5">
              <FilterSlider
                label="Min Winner Score"
                value={filters.minWinnerScore}
                onChange={(v) => onChange({ minWinnerScore: v })}
                display={`${filters.minWinnerScore}`}
              />
              <FilterSlider
                label="Min margin"
                value={filters.minMargin}
                onChange={(v) => onChange({ minMargin: v })}
                display={`${filters.minMargin}%`}
              />
              <FilterSlider
                label="Max competition"
                value={filters.maxCompetition}
                onChange={(v) => onChange({ maxCompetition: v })}
                display={`${filters.maxCompetition}`}
              />
              <FilterSlider
                label="Max saturation"
                value={filters.maxSaturation}
                onChange={(v) => onChange({ maxSaturation: v })}
                display={`${filters.maxSaturation}`}
              />
              <FilterSlider
                label="Min growth"
                min={-100}
                max={300}
                value={filters.minGrowth}
                onChange={(v) => onChange({ minGrowth: v })}
                display={`${filters.minGrowth}%`}
              />
              <FilterSlider
                label="Max shipping time"
                min={1}
                max={60}
                value={filters.maxShippingDays}
                onChange={(v) => onChange({ maxShippingDays: v })}
                display={`${filters.maxShippingDays}d`}
              />

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Country</Label>
                <Select value={filters.country} onValueChange={(v) => onChange({ country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any country</SelectItem>
                    {facets.countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground"
                onClick={() => onChange(DEFAULT_FILTERS)}
              >
                <X className="size-3.5" />
                Reset filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function FilterSlider({
  label,
  value,
  onChange,
  display,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  display: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <Label className="text-muted-foreground">{label}</Label>
        <span className="font-medium tabular-nums">{display}</span>
      </div>
      <Slider min={min} max={max} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
